!(function(window, d3) {

    'use strict';


    let url_img = '../../img/';
    let url_data = '../../data/';
    let selectValues = null;

    window.onload = function() {
        d3.queue()
            //.defer(d3.json, url_data + 'data_final_unicode.json')
            .defer(d3.json, url_data + 'dictionary.json')
            .await(init);


    };
    
    function update_list(select_values){
	    
	    console.log('update_list',select_values );
		let table_container = d3.select('#table_container').selectAll('.ambito-container').classed('hidden', true);
		
		if(select_values.ambito === "0"){ 
			
			d3.select('#table_container').selectAll('.ambito-container').classed('hidden', false); 
			
		}else{
			d3.select('#ambito_' + select_values.ambito).classed('hidden', false);

			if(select_values.subambito === "0"){
				
				//console.log(' + select_values.ambito', d3.select('#ambito_' + select_values.ambito));
				d3.selectAll('#ambito_' + select_values.ambito + ' > div').classed('hidden', false);

			}else{
				
	
				d3.selectAll('#ambito_' + select_values.ambito + ' > div').classed('hidden', true);
				d3.select('#ambito_' + select_values.ambito).select('#ambito_banner_' + select_values.ambito).classed('hidden', false);
				d3.select('#ambito_' + select_values.ambito).select('#subambito_' + select_values.subambito).classed('hidden', false);
				
			}
		}
		
	    
    }

	
	/**** --- BUILD SELECTS ***/
	
	function build_selects(dic){
		
		console.log('building selects.....', dic);
		const dic_ambitos = dic.industria_4.ambitos;
		const dic_subambitos = dic.industria_4.subambitos;
		
		const ambito_select = d3.select('#ambito_select').on('change',onchange);
		const subambito_select = d3.select('#subambito_select').on('change',onchange);
			
					
		selectValues = { "ambito": 0, "subambito": 0 };
		

		// console.log('build_selects', ambito_select, subambito_select, mejora_select);
		
		
        function updateSelect() {

                return{

                    ambito: ambito_select.property('selectedOptions')[0].value,
                    subambito: subambito_select.property('selectedOptions')[0].value,

                };
            }

		
		function get_industry_obj(id, dic){
			
			//console.log('get_industry_obj', id, dic);
				
				let temp =dic.filter(function(d) { 
					// console.log('d', d.parent_id);
					return d.ambito_id === +id;
					
					});
				//console.log('get_industry_obj temp', temp);
				return temp;
		}


		function onchange(){

				//console.log('enter onchange....');
				selectValues = updateSelect();
				console.log('selectValues',selectValues);
				let ambito_id = +selectValues.ambito;
				// let select_subambito = selectValues.subambito - 1; 
				let subambito_obj = [];
				let subambito_first_option = {"ambito": "Industria 4.0", "ambito_id":0, "description": "Industria 4.0", "original_name": "Todos los subámbitos", "subambito": "Todos los subámbitos", "subambito_id": 0, "subambito_short_name": "Todos los subámbitos"};
			


				if(this.dataset.select === "parent_select" ){
					
					if( +ambito_id === 0){
						// console.log('zero', ambito_id );
						subambito_obj.push(subambito_first_option);
					}
					
					if(!!ambito_id && +ambito_id != 0){
						// console.log('no zero', ambito_id );
						subambito_obj = get_industry_obj(ambito_id, dic_subambitos);
						subambito_obj.unshift(subambito_first_option);

						
					}
					

					// console.log('onchange ambito_id', ambito_id);

					// console.log('enter onchange parent select....');
					// console.log('this.dataset.select', this.dataset.select);
					// console.log('onchange this.value', this.value);
					// console.log('onchange subambito_obj', subambito_obj);
	
					let options = subambito_select
						.selectAll('option')
						.remove()
						.exit()
						.data(subambito_obj)
						.enter()
						.append('option')
						.each(function(d, i){
							//console.log('dd, ii', d, i);
							/*
							if( d.subambito_id === +select_subambito + 1){
								//d3.select(this).attr('selected', 'selected');
							}
							*/
						})	
	
						.attr('value', function(d){ 
							//console.log('d.subambito_id', d.subambito_id, d); 
							return d.subambito_id ? d.subambito_id : '0';
						})
						.text(function (d) { 
							//console.log('option', d);
							return d.subambito_short_name;
;
						});
						// console.log('options', options);
						
						
					let element = document.getElementById('subambito_select');
					element.dispatchEvent(new Event("change")); 	
					 
				} //  --> if ends
				
				update_list(selectValues);
				
			
	
				
				
			
			
			
		} //  --> onChange
		
		
		
		
	}//  --> Build Select



	function nest_list_data (data){
		
		let nested_list_data = d3.nest()
            .key(function(d) {
	            return d["ambito_id"];
                
            })
            .entries(data)
            .sort(function(a,b) { return d3.ascending(a.values[0].subambito_id,b.values[0].subambito_id); });
            
        return nested_list_data; 
        
	}


	function get_dictionary_obj(dic, key_to_check, value_to_check){
		//console.log('get_dictionary_property', dic, key_to_check, value_to_check, key_to_return);
		const dic_length = dic.length;
		let i = 0;
		let result = null;
		
		for(i; i<dic_length; i++){
			
			if(dic[i][key_to_check] === value_to_check){
				result = dic[i];
			}
		}
		// console.log('get_dictionary_obj', result);
		return result;
		
		
		
	}

	function draw_table(dic, select_values){
		console.log('draw_table select_values', select_values);
		
		const dic_ambitos = dic.industria_4.ambitos;
		const dic_subambitos = dic.industria_4.subambitos;
		let table_container = d3.select('#table_container');
		
		let nested_list_data = nest_list_data(dic_subambitos);
		nested_list_data.shift();
		console.log('nested_list_data', nested_list_data);

		let ambito_main = table_container
			.selectAll('div')
			.data(nested_list_data)
			.enter()
			.append('div')			
			.attr('class', 'container margin-bottom--24 ambito-container')
			.attr('data-key', function(d,i){
				return d.key;
			})
			.attr('id', function(d,i){
				return "ambito_" + d.key;
			});


		
		let ambito_banner = ambito_main
				.append('div')
				.attr('class', 'container ambito-banner')
				.attr('data-banner', function(d,i){
					return d.key;
				})
				.attr('id', function(d,i){
					return "ambito_banner_" + d.key;
				})
				.html(function(d, i){
					
					let option_obj = get_dictionary_obj(dic_ambitos, 'ambito_id', +d.key);
					let ambito = option_obj.ambito;
					let ambito_short_name = option_obj.ambito_short_name;
					let description = option_obj.description;
					let original_name = option_obj.original_name;



					return  '<div class="container margin-bottom--24">'+
						'<div class="row">' +
				            '<div class="col-12">' +
								'<img class="img-fluid" src="../../img/ambitos/ambito_' + d.key + '.jpg" alt="Fabricación avanzada">' +
								'<h1 class="title-ambito green-container"><span class="icon-image icon_ambito_1"></span>'+ original_name + '</h1>' +
								'<h2 class="subtile-ambito"><span>' + ambito_short_name + '</span></h2>' +
								'<p><strong> ' + description + '</strong></p>' +
							'</div>'+
						'</div>' +
					'</div>';

					
				});
				
				
		let subambito_item = ambito_main
			.selectAll('div')
			.exit()
			.data(function(d) { return d.values}, function(d,i) { return d; })
			.enter()
			.append('div')
			.attr('class', 'container margin-bottom--24 subambito-container')
			.attr('data-key', function(d,i){
				return "subambito_" + d.subambito_id;
			})
			.attr('id', function(d,i){
				return "subambito_" + d.subambito_id;
			})

			.html(function(d, i){
				
					let option_obj = get_dictionary_obj(dic_subambitos, 'subambito_id', +d.subambito_id);
					let subambito = option_obj.subambito;
					let subambito_short_name = option_obj.subambito_short_name;
					let description = option_obj.description;
					let original_name = option_obj.original_name;
					
					
								
					return   '<div class="container">'+
					
					'<div class="row">'+
						'<div class="col-12">'+
						
							'<h4 class="subtile-subambito">'+original_name+'</h4>'+
							'<h3 class="title-subambito">' + subambito_short_name + '</h3>'+
							'<p>' + description + '</p>'+
							'</div>'+
							'</div>'+
							'</div>';
      
					
				});
			
		
	}





    let init = function(error, dic) {
        console.log('hello from D3', dic);
        if (error) throw error;
	    build_selects(dic);
	    draw_table(dic, { "ambito": 0, "subambito": 0 });


    } // --> init ends            

})(window, d3);