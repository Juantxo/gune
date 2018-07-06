!(function(window, d3) {

    'use strict';
    

	let url_img= '../../img/';
	let url_data = '../../data/';
	let tree_counter = false;
	let selectValues = null;
	
    window.onload = function() {
	    d3.queue()
		.defer(d3.json, url_data + 'data_final_unicode.json')
		.defer(d3.json, url_data + 'dictionary.json')
		.await(init);

	    
    };
    
	/**** --- NEST DATA: data nest for tree ***/

	function nest_list_data (data){
		
		let nested_list_data = d3.nest()
            .key(function(d) {
                return d["cod"];
            })
            .entries(data)
            .sort(function(a,b) { return d3.ascending(a.values[0].capacidad_dos,b.values[0].capacidad_dos); });
            
        return nested_list_data;    
		
		
	}
	







	function get_capacidad_obj(id, dic){
			
			//console.log('get_capacidad_obj', id, dic);
				
				let temp = dic.filter(function(d) { 
					//console.log('d', d.parent_id);
					return +d.parent_id === +id;
					
					});
				//console.log('temp', temp);
				// console.log('get_capacidad_obj temp', temp);
				return temp;
		}

	/**** --- BUILD SELECTS ***/
	
	

	function build_selects(data, dic){
		
		console.log('building selects.....');
		const dic_capacidad_uno = dic.capacidades.capacidades_uno;
		const dic_capacidad_dos = dic.capacidades.capacidades_dos;
		const dic_ambitos = dic.industria_4.ambitos;
		console.log('building selects', dic_capacidad_uno, dic_capacidad_dos, dic_ambitos);


		const capacidad_uno_select = d3.select('#capacidad_uno_select').on('change',onchange);
		const capacidad_dos_select = d3.select('#capacidad_dos_select').on('change',onchange);
		const ambito__select = d3.select('#ambito_select').on('change',onchange); // now doing nothing! only log values

		
        function updateSelect() {

                return{

                    capacidad_uno: capacidad_uno_select.property('selectedOptions')[0].value,
                    capacidad_dos: capacidad_dos_select.property('selectedOptions')[0].value,
                    ambito: ambito__select.property('selectedOptions')[0].value

                };
            }








		function onchange(){
			
			
				if(this.dataset.select === "capacidad_uno_select" ){
					// console.log('enter onchange parent select....');
					// console.log('this.dataset.select', this.dataset.select);
					// console.log('onchange this.value', this.value);
					let capacidad_dos_obj = null;
					
					if(this.value === "0" || this.value ==="" ){
						capacidad_dos_obj = [{id: 0, capacidad_dos: "Todas los tipos", json: "todos", parent_id: null, capacidad_uno: "Todas", parent_id: 0 }];
					}else{
						capacidad_dos_obj = get_capacidad_obj(this.value, dic_capacidad_dos);	
					}
					
					// console.log('onchange capacidad_dos_obj', capacidad_dos_obj );
					
					
					let options = capacidad_dos_select
						.selectAll('option')
						.remove()
						.exit()
						.data(capacidad_dos_obj)
						.enter()
						.append('option')
						.each(function(d, i){
							//console.log('dd, ii', d, i);
							/*
							if( d.subambito_id === +select_subambito + 1){
								d3.select(this).attr('selected', 'selected');
							}
							*/
						})	
	
						.attr('value', function(d){ 
							//console.log('d.subambito_id', d.subambito_id, d); 
							return d.id ? d.id : '0';
						})
						.text(function (d) { 
							// console.log('option', d);
							return d.capacidad_dos;
						});
						// console.log('options', options);
					 
				} //  --> if ends
				
				selectValues = updateSelect();
				console.log('selectValues', selectValues);

		
		
		}
		
		
	}	



	function draw_table(t, dic){
		
		console.log('draw_table t', t);
	}
	
	
	function init_table(gune, dic){
		console.log('init_table.....');
		
		let titulos = nest_list_data(gune);
		draw_table(titulos, dic);
		



	}
	
	
	function init_pill_tabs(data, dic){
		
		const pill_list_tab = d3.select('#pills-list-tab');
		const pill_tree_tab = d3.select('#pills-tree-tab');
		
		
		pill_list_tab.on('click', function(){

			
			console.log('pill_list_tab', tree_counter);

			
			
		});

		pill_tree_tab.on('click', function(){
			
			
			
		});



	}
	
	
	
    let init = function(error, gune, dic) {
		
		//console.log('hello from D3', gune, dic);
		if (error) throw error;
		
	    build_selects(gune, dic);
	    init_table(gune, dic);

    }	// --> init ends            

})(window, d3);