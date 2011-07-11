(function($){

    
    
    $(document).ready(function() {
        
        mapstraction = new mxn.Mapstraction('map', mapinfo.api);
        
        
        mapstraction.applyFilter = function(o, f) {
            var vis = true;
            
            //console.log(o);
            //console.log(f);
            
            switch (f[1]) {
                case 'ge':
                    if (o.getAttribute( f[0] ) < f[2]) {
                        vis = false;
                    }
                    break;
                case 'le':
                    if (o.getAttribute( f[0] ) > f[2]) {
                        vis = false;
                    }
                    break;
                case 'eq':
                    
                    if (o.getAttribute( f[0] ) != f[2]) {
                        //console.log(o.getAttribute( f[0] ));
                        vis = false;
                    }
                    break;
                case 'in':
                    
                    if ( typeof(o.getAttribute( f[0] )) == 'undefined' ) {
                        vis = false;
                    } else if ( o.getAttribute( f[0] ).indexOf(f[2]) == -1 ) {
                        vis = false;
                    }
                    break;
            }

            return vis;
        };
        
        mapstraction.setCenterAndZoom(new mxn.LatLonPoint(parseFloat(mapinfo.lat), parseFloat(mapinfo.lng)), parseInt(mapinfo.zoom));
        
        if (mapinfo.api == 'googlev3') {
            mapstraction.setMapType(mxn.Mapstraction[mapinfo.type.toUpperCase()]);
        }
        
        
        
        // Load posts
        
        $.post(
            mapinfo.ajaxurl,
            {
                get: 'totalPosts',
                action: 'mapasdevista_get_posts',
                page_id: mapinfo.page_id
            },
            function(data) {
                totalPosts = parseInt(data);
                loadPosts(totalPosts, 0);
            }
        );
        
        function loadPosts(total, offset) {
        
            var posts_per_page = 2;
            
            $.ajax({
                type: 'post',
                url: mapinfo.ajaxurl,
                dataType: 'json',
                data: {
                    page_id: mapinfo.page_id,
                    action: 'mapasdevista_get_posts',
                    get: 'posts',
                    offset: offset,
                    total: total,
                    posts_per_page: posts_per_page
                },
                success: function(data) {
                    
                    console.log('loaded posts:'+offset);
                    //console.log(data.posts);
                    
                    if (data.newoffset != 'end') {
                        loadPosts(total, data.newoffset);
                    } else {
                        console.log('fim');
                    }
                    
                    for (var p = 0; p < data.posts.length; p++) {
                        var pin = data.posts[p].pin;
                        var pin_size = [pin['1'], pin['2']];
                        var pin_anchor = [parseInt(pin['anchor']['x']), parseInt(pin['anchor']['y'])];

                        var ll = new mxn.LatLonPoint( data.posts[p].location.lat, data.posts[p].location.lon );
                        var marker = new mxn.Marker(ll);

                        marker.setIcon(pin[0], pin_size, pin_anchor);
                        marker.setAttribute( 'date', data.posts[p].date );
                        marker.setAttribute( 'post_type', data.posts[p].post_type );
                        marker.setAttribute( 'number', data.posts[p].number );
                        
                        for (var att = 0; att < data.posts[p].terms.length; att++) {
                        
                            if (typeof(marker.attributes[ data.posts[p].terms[att].taxonomy ]) != 'undefined') {
                                marker.attributes[ data.posts[p].terms[att].taxonomy ].push(data.posts[p].terms[att].slug);
                            } else {
                                marker.attributes[ data.posts[p].terms[att].taxonomy ] = [ data.posts[p].terms[att].slug ];
                            }
                        
                        }
                        
                        mapstraction.addMarker( marker );
                    
                    }
                    
                }
                
            });
            
        }
        
        // Filters events
        
        $('.taxonomy-filter-checkbox').click(function() {
        
            var tax = $(this).attr('name').replace('filter_by_', '').replace('[]', '');
            var val = $(this).val();
            
            if ( $(this).attr('checked') ) {
                mapstraction.addFilter(tax, 'in', val);
            } else {
                mapstraction.removeFilter(tax, 'in', val);
            }
            
            mapstraction.doFilter();
        
        });
        
        $('.post_type-filter-checkbox').click(function() {
        
            var val = $(this).val();
            
            if ( $(this).attr('checked') ) {
                mapstraction.addFilter('post_type', 'eq', val);
            } else {
                mapstraction.removeFilter('post_type', 'eq', val);
            }
            
            mapstraction.doFilter();
        
        });
        
        $('#filter_by_new').click(function() {
        
            if ( $(this).attr('checked') ) {
                mapstraction.addFilter('number', 'le', 2);
            } else {
                mapstraction.removeFilter('number', 'le', 2);
            }
            
            mapstraction.doFilter();
        
        });
        
        
        
        
        
    
    });
    
})(jQuery);
