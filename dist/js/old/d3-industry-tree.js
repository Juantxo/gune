!(function(window, d3) {

    'use strict';
    

	let url_img= '../../img/';
	let url_data = '../../data/';
	let url_js = '../../js/';
	
    window.onload = function() {
	    d3.queue()
		.defer(d3.json, url_data + 'gune_data-v5.json')
		.defer(d3.json, url_data + 'dictionary.json')
		.await(init);

	    
    };
	
	
	
	
	/**** --- NEST DATA: data nest ***/

	function nest_data(data){
        
        let nested_data = d3.nest()
            .key(function(d) {
                return d.centro;
            })
            //.key(function(d) { return d.capacidad_uno; })
            .key(function(d) {
                return d.capacidad_dos;
            })
            .key(function(d) {
                return d.titulo;
            })

            //.rollup(function(v) { return v.length; }) 
            // rollup takes the array of values for each group and it produces a value based on that array
            .entries(data);
        
        return nested_data;     
		
		
	}

	

	





	
	
	/**** --- DRAW COLLAPSIBLE TREE  ***/
	
	function draw_collapsible_tree(data){
		
        var guneTree = {
            'key': "4GUNE",
            "values": nest_data(data)

        };
        // console.log('guneTree:: ', guneTree);

        var root = d3.hierarchy(guneTree, function(d) {
            //console.log('d from hierarchy', d);
            return d.values;

        });
        // console.log('root:: ', root);


        var margin = {
                top: 20,
                right: 90,
                bottom: 30,
                left: 90
            },
            width = 960 - margin.left - margin.right,
            height = 750 - margin.top - margin.bottom;

        var colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(['red', 'green']);
        var widthScale = d3.scaleLinear()
            .domain([1, 80])
            .range([1, 10]);


        var i = 0,
            duration = 750;

        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([height, width]);
        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level
        root.children.forEach(collapse);

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" +
                margin.left + "," + margin.top + ")");


        update(root);
        // Collapse the node and all it's children
        function collapse(d) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            console.log('treeData', treeData);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) {

                //console.log('nodes', nodes);
                d.y = d.depth * 180
            });

            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.selectAll('g.node')
                .data(nodes, function(d) {

                    // console.log('nodes d', d.depth);
                    return d.id || (d.id = ++i);
                });
            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click);

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .style("stroke", function(d) {
                    return colorScale(d.data.female / (d.data.female + d.data.male))
                });

            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("x", function(d) {
                    // return d.children || d._children ? -13 : 13;
                    return d.depth <=2 ? -13 : 13;
                })
                .attr("text-anchor", function(d) {
	                // console.log('d text', d.depth);
                    // return d.children || d._children ? "end" : "start";
                    return d.depth <=2 ? "end" : "start";
                })
                .text(function(d) {
                    return d.data.key;
                })
                .style("fill", function(d) {
                    return colorScale(d.data.female / (d.data.value))
                });

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .attr('r', 10)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, function(d) {
                    return d.id;
                })
                .style('stroke-width', function(d) {
                    return widthScale(d.data.value)
                });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    }
                    return diagonal(o, o)
                })
                .style('stroke-width', function(d) {
                    return widthScale(d.data.value)
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d) {
                    return diagonal(d, d.parent)
                });

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    }
                    return diagonal(o, o)
                })
                .style('stroke-width', function(d) {
                    return widthScale(d.data.value)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                var path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

                return path
            }

            // Toggle children on click.
            function click(d) {
                console.log('click', d);

                if (d.depth <= 2) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    update(d);

                }
            }
        } // --> update source ends
		
		
	};
	
	
	function init_ver_mas(){
		var x = document.getElementsByTagName("BODY")[0].addEventListener('click', function(e) {
			// do nothing if the target does not have the class drawnLine
				//if (!e.target.classList.contains("drawnLine")) return;
				
				if(e.target.id.indexOf("link_") > -1){
					
					
					let el = e.target;
					let temp = el.id.split('_')[1];
					
					let tab  = d3.select('#more_' + temp)
					console.log(temp, d3.select('#more_' + temp));
					// el.attr("class", "hidden");
					
					tab.classed("hidden", tab.classed("hidden") ? false : true);
					
					console.log(d3.select(el).html());
					d3.select(el).html() === '&nbsp;Ver menos' ? d3.select(el).html('&nbsp;Ver más') : d3.select(el).html('&nbsp;Ver menos'); 

				}
		});
		
	}
	
	
	
    let init = function(error, gune, dic) {
		
		console.log('hello from D3', gune, dic.ambitos);
		if (error) throw error;
		



	    draw_collapsible_tree(gune);
	    
	    
	    

        //console.log('data:: ', _4GUNE_DATA);
        // console.log('dictionary:: ', dictionary.ambitos);

        //console.log('gunePorCentro:: ', JSON.stringify(gunePorCentro));
        // console.log('gunePorCentro:: ', gunePorCentro);


		

    }	// --> init ends            

})(window, d3);