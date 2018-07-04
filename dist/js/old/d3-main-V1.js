!(function(window, d3) {

    'use strict';
    



    window.onload = function() {
	    d3.queue()
		.defer(d3.json, './data/gune_data-v5.json')
		.defer(d3.json, './data/dictionary.json')
		.await(init);

	    
    };
	
	
	/**** --- FILTERING DATA --- ***/

	
	function filter_data(database, select_val){
		
		console.log('data to filter TBD', database, typeof(select_val.ambito));
		
		let ambito_filter = database.filter(function(d){
			
				return +d.ambito_id === +select_val.ambito;
		});
		
		let subambito_filter = ambito_filter.filter(function(d){
			
				return +d.subambito_id === +select_val.subambito;
		

		});
		
		let presencia_filter = subambito_filter.filter(function(d){
			
			// console.log(typeof(' d.presencia',  d.presencia)); 
			// --> number
			return +d.presencia === +1;
		});



		
				
		//console.log('data ambito_filter', ambito_filter);
		//console.log('data subambito_filter', subambito_filter);
		console.log('data presencia_filter', presencia_filter);
		return presencia_filter;
		
		
	}// --> end filter_data
	
	
	
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

	function get_dictionary_property(dic, key_to_check, value_to_check, key_to_return){
		//console.log('get_dictionary_property', dic, key_to_check, value_to_check, key_to_return);
		const dic_length = dic.length;
		let i = 0;
		let result = null;
		
		for(i; i<dic_length; i++){
			
			if(dic[i][key_to_check] === value_to_check){
				result = dic[i][key_to_return];
			}
		}
		
		return result;
		
		
	}	
	
	

	
	/**** --- BUILD SELECTS ***/
	
	function build_selects(data, dic){
		const dic_ambitos = dic.ambitos;
		const dic_mejoras = dic.mejoras;
		const ambito_select = d3.select('#ambito_select').on('change',onchange);
		const subambito_select = d3.select('#subambito_select').on('change',onchange);
		const mejora_select = d3.select('#mejora_select').on('change',onchange_mejora); // now doing nothing! only log values
		
		console.log('build_selects', ambito_select, subambito_select, mejora_select);
		
		
        function updateSelect() {

                return{

                    ambito: ambito_select.property('selectedOptions')[0].value,
                    subambito: subambito_select.property('selectedOptions')[0].value,
                    mejora: mejora_select.property('selectedOptions')[0].value

                };
            }

		function get_options_data(val){
				// console.log('val', val, dic_ambitos);
				
				let temp = dic_ambitos.filter(function(d) { 
					// console.log('d', d.parent_id);
					return d.parent_id === +val && d.id > 10;
					
					});
				// console.log('temp', temp);
				return temp;
		}
		



		function onchange_mejora(){
			
			let options_data = this.value; // string
			let options_name = get_dictionary_property(dic_mejoras, 'id', +options_data, 'json'); // todas, i_d, produccion...
			console.log('options_name', options_name);
			let green_stars = d3.selectAll('.star_' + options_name + " i.star-icon--gray");
			// console.log('green_stars', green_stars);
			d3.selectAll('.table-row-parent').classed('mejora_hidden', false);
			green_stars.each(function(d, i) { 
				let el = this.parentNode.parentNode.parentNode.parentNode;
				d3.select(el).classed('mejora_hidden', true );
			});			
			console.log('temp::: ',results_partial);
			
			draw_result_numbers(results_partial, options_name);


			
			// we are here
			//let temp = filter_data(data, selectValues);
				// console.log('temp::: ',temp);

			
			
			
		}
		
		
		
		
		function onchange(){
			
			if(this.dataset.select === "parent_select" ){
				
				// console.log(this.dataset.select);
				// console.log(this.value);
				
				let options_data = get_options_data(this.value);
				/*
				let first_option = {
					ambito: null,
					ambito_id: null,
					ambito_short_name: null,
					id: null,
					parent_id:"",
					subambito: "Subámbito",
					subambito_id: null,
					subambito_short_name:"Subámbito"
				};
				let second_option = {
					ambito: null,
					ambito_id: null,
					ambito_short_name: null,
					id: null,
					parent_id:"",
					subambito: "Todos los subámbitos",
					subambito_id: "0",
					subambito_short_name:"Todos los subámbitos"
				};
				
				options_data.unshift(first_option, second_option );
				
				*/
						    //<option selected="true" disabled="disabled" hidden value="">Subámbito</option>
							//<option value="0">Todos los subámbitos</option>

				let options = subambito_select
					.selectAll('option')
					.remove()
					.exit()
					.data(options_data)
					.enter()
					.append('option')
					.each(function(d, i){
						// console.log('dd, ii', d, i);
						
						if( i === 0){
							d3.select(this).attr('selected', 'selected');
						}
					})	

					.attr('value', function(d){ 
						//console.log('d.subambito_id', d.subambito_id, d); 
						return d.subambito_id ? d.subambito_id : '';
					})
					.text(function (d) { 
						// console.log('option', d);
						return d.subambito_short_name;
					});
					// console.log('options', options);
				 
			} //  --> if ends
			
			
			
						
			if(this.dataset.select != "mejora_select" ){
				
				let selectValues = updateSelect();
				console.log('selectValues::: ',selectValues, dic_ambitos);
				
				let temp = filter_data(data, selectValues);
				// console.log('temp::: ',temp);
				activate_keys();
				// document.getElementById('mejora_select').options[0].selected = 'selected';
				mejora_select.property('value', '0');
				draw_table(temp, selectValues, dic);
			}			
			
			
		} //  --> onChange
		
		
		
		
	}//  --> Build Select

	// activate table keys when selects change
	function activate_keys(){
		
		let the_keys = d3.selectAll('.table-keys--key');
		
		the_keys.each(function(d) {
      		 // console.log(d3.select(this.parentNode.parentNode));
	  		 d3.select(this.parentNode.parentNode).classed("table-key--active", true);
    	});
		
	}

	/********* --- TABLE 4gune: helper functions --- *************
	**************************************************************/
	
		
	/*** --- Check MEJORAS: devuelve un objeto que contabiliza (true or false) si la mejora está presente en la data ---*/
	
	function check_mejoras(data){
		
		// console.log('check_mejoras data', data.values);
		
		let values = data.values;
		let valuesL = values.length;
		let counter = {
			"i_d": {"total": valuesL, "checks": 0, "bool": false },
			"produccion": {"total": valuesL, "checks": 0, "bool": false },
			"suministro_y_compras": {"total": valuesL, "checks": 0, "bool": false },
			"almacenamiento_y_logistica": {"total": valuesL, "checks": 0, "bool": false },
			"marketing": {"total": valuesL, "checks": 0, "bool": false },
			"ventas": {"total": valuesL, "checks": 0, "bool": false },
			"servicios": {"total": valuesL, "checks": 0, "bool": false },
			"administracion":{"total": valuesL, "checks": 0, "bool": false }
		}
		let temp = ["i_d", "produccion", "suministro_y_compras", "almacenamiento_y_logistica","marketing", "ventas", "servicios", "administracion"]; 
		let tempL = temp.length;
		let i = 0;
		let j;
		
		for (i; i < valuesL; i++){
			
					
					
		//if(data.values[i].cod === 25){ console.log('check_mejoras data', data.values[i]);}			

			j = 0;
			
			for (j; j < tempL; j++){
			//console.log('check_mejoras values[temp[j]]', values[i][temp[j]], temp[j]);
				if(values[i][temp[j]] === 1){
					
					counter[temp[j]]['checks']++; 
					
				}
			}
		}
		
		for (var prop in counter) {
		    if (counter.hasOwnProperty(prop)) {
			    // console.log(counter[prop].total);
			    if(counter[prop].total === counter[prop].checks ){ counter[prop].bool = true; }
		    }
		}		
		
		
		//console.log('check_mejoras counter', counter);
		return counter;
		
	}
	
	
	/*** --- Check class to fill star ---*/
	function addClass_to_star(d, val){
		let values_counter = check_mejoras(d);
		let theClass = 'star-icon--gray';
		
		if(values_counter[val].bool){
			theClass = 'star-icon--green';
		}
		return theClass;
	}
	
	/*** --- Check web info ---*/
	function checkWebInfo(val){
		//console.log('checkWebInfo',val);
		if(val.indexOf('http') != -1){
			return '<i class="fa">&#xf13d;</i><a href="' + val + '"';
		}else{
			return '<a href="javascript:void(0);" class="hidden"' ;
		}
	}
	
	/*** --- Check email info ---*/
	function getEmailInfo(val){
		// console.log('getEmailInfo',val);
		// <i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:example@example.com?subject=4GUNE Clúster Industria 4.0">Iñaki Vázquez</a> </span>
		
		let email = val.email.trim().replace('(at)', "@");
		let responsable = val.responsable.trim();
		const emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		let emailIsOk = emailRe.test(email);
		// console.log('getEmailInfo',email, emailIsOk, responsable);
		
		if(emailIsOk){
			if( responsable && responsable != "NO DISPONIBLE" ){
				return '<i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:' + email + '?subject=4GUNE Clúster Industria 4.0">' + responsable + '</a> </span>';
			}else{
				return '<i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:' + email + '?subject=4GUNE Clúster Industria 4.0">' + 'Contacto' + '</a> </span>';
			}
		}
		if(!emailIsOk){
			if( responsable && responsable != "NO DISPONIBLE" ){
				return '<i class="fa">&#xf0e0;</i><span>&nbsp;' + responsable + '</a> </span>';
			}else{
				return '';
			}			
		}
	}
	function addClass_to_bullet(d){
		//console.log('addClass_to_bullet', d);
		let bullet = 'class="fa">&#xf111;';
		
		switch(d){
			case "Transferencia":
				return 'class="fa redColor">&#xf111;'; // pinta TODOS los títulos en los que exista presencia de alguna mejora.
				break;
			case "Formación":
				return 'class="fa blueColor">&#xf111;';
				break;
			case "Investigación":
				return 'class="fa purpleColor">&#xf111;';
				break;
			case "Instalaciones y equipos":
				return 'class="fa orangeColor">&#xf111;';
				break;
			default:
				return bullet;	
		} // --> end swicth
			

		return bullet;
		
		
	}
	function addAttrDataName_to_row(d){
		//console.log('addAttrDataName_to_row', d);
		
		switch(d){
			case "Transferencia":
				return 'transferencia'; // pinta TODOS los títulos en los que exista presencia de alguna mejora.
				break;
			case "Formación":
				return 'formacion';
				break;
			case "Investigación":
				return 'investigacion';
				break;
			case "Instalaciones y equipos":
				return 'instalaciones_y_equipos';
				break;
			default:
				return '';	
		} // --> end swicth
		
	}
	
	
	
	function get_results_numbers(data, dictionary){
		console.log('get_results_numbers', data);
		let dic = dictionary;
		let dataL = data.length;
		let result_numbers = {
			
			"total": {"total": dataL, "number": 0, "mejoras": { "i_d": 0, "produccion": 0, "suministro_y_compras": 0, "almacenamiento_y_logistica": 0, "marketing": 0,"ventas": 0,"servicios": 0,"administracion":0, "total": 0 } },
			"formacion": {"total": dataL, "number": 0, "mejoras": { "i_d": 0, "produccion": 0, "suministro_y_compras": 0, "almacenamiento_y_logistica": 0, "marketing": 0,"ventas": 0,"servicios": 0,"administracion":0, "total": 0 } },
			"instalaciones_y_equipos": {"total": dataL, "number": 0, "mejoras": { "i_d": 0, "produccion": 0, "suministro_y_compras": 0, "almacenamiento_y_logistica": 0, "marketing": 0,"ventas": 0,"servicios": 0,"administracion":0, "total": 0 } },			
			"investigacion": {"total": dataL, "number": 0, "mejoras": { "i_d": 0, "produccion": 0, "suministro_y_compras": 0, "almacenamiento_y_logistica": 0, "marketing": 0,"ventas": 0,"servicios": 0,"administracion":0, "total": 0 } },			
			"transferencia": {"total": dataL, "number": 0, "mejoras": { "i_d": 0, "produccion": 0, "suministro_y_compras": 0, "almacenamiento_y_logistica": 0, "marketing": 0,"ventas": 0,"servicios": 0,"administracion":0, "total": 0 } }			
		};
		
			
		function count_mejoras_obj(prop, values, dic){
			// console.log('count_mejoras_obj', values);
			let temp_obj = result_numbers[prop].mejoras;
			
			// We are here
			//console.log('temp_val', temp_val);
				for( let p in temp_obj ){
					if (temp_obj.hasOwnProperty(p)) {
							if(values[p] === 1){
								temp_obj[p]++;
								temp_obj["total"]++;
								result_numbers['total']['mejoras'][p]++;
								result_numbers['total']['mejoras']['total']++;
							}
						//console.log('values[p]', values[p], p);
						//temp[p] = 'xxx';
	    			}				
				}
			return temp_obj;
		}
	
			
			
			
		let i = 0;
		
		for(i; i < dataL; i++){
			
			if(data[i].values[0].capacidad_uno){
				
				// console.log('data[i].values[0]', data[i].values[0]);
				
				switch(data[i].values[0].capacidad_uno){
					
					case "Transferencia":
						result_numbers['transferencia']["number"]++; // pinta TODOS los títulos en los que exista presencia de alguna mejora.
						result_numbers['total']["number"]++;
						result_numbers['transferencia'].mejoras = count_mejoras_obj('transferencia', data[i].values[0], dic);
						break;
					case "Formación":
						result_numbers['formacion']["number"]++;
						result_numbers['total']["number"]++;
						result_numbers['formacion'].mejoras = count_mejoras_obj('formacion', data[i].values[0], dic);
						break;
					case "Investigación":
						result_numbers['investigacion']["number"]++;
						result_numbers['total']["number"]++;
						result_numbers['investigacion'].mejoras = count_mejoras_obj('investigacion', data[i].values[0], dic);
						break;
					case "Instalaciones y equipos":
						result_numbers['instalaciones_y_equipos']["number"]++;
						result_numbers['total']["number"]++;
						result_numbers['instalaciones_y_equipos'].mejoras = count_mejoras_obj('instalaciones_y_equipos', data[i].values[0], dic);
						break;
					default:
						return '';	
				} // --> end swicth
				
			}
			
		}
		
		return result_numbers;
		
	};
	
	
	function draw_result_numbers(d, option_value){
		// options_name
		
		// console.log('draw_result_numbers', d);
		// Aquí
		if(option_value && option_value === "total"){
			let results_total = d3.select('#results_total').html(d.total.number);
			let results_formacion = d3.select('#results_formacion').html(d.formacion.number);
			let results_transferencia = d3.select('#results_transferencia').html(d.transferencia.number);
			let results_instalaciones_y_equipos = d3.select('#results_instalaciones_y_equipos').html(d.instalaciones_y_equipos.number);
			let results_investigacion = d3.select('#results_investigacion').html(d.investigacion.number);
			
		}
		if(option_value && option_value !== "total"){
			let results_total = d3.select('#results_total').html(d.total.mejoras[option_value]);
			let results_formacion = d3.select('#results_formacion').html(d.formacion.mejoras[option_value]);
			let results_transferencia = d3.select('#results_transferencia').html(d.transferencia.mejoras[option_value]);
			let results_instalaciones_y_equipos = d3.select('#results_instalaciones_y_equipos').html(d.instalaciones_y_equipos.mejoras[option_value]);
			let results_investigacion = d3.select('#results_investigacion').html(d.investigacion.mejoras[option_value]);
			
		}
	};
	
	
	
	function get_the_select_info(values, dic){
		
		// console.log('get_the_select_info', values, dic);
		
		// Level -->ambito, subambito, mejora
		let dic_ambitos = dic.ambitos;
		let dic_mejoras = dic.mejoras;
		let dic_ambitos_length = dic_ambitos.length;
		let dic_mejoras_length = dic_mejoras.length;


		let level_keys = Object.keys(values); // ["ambito", "subambito", "mejora"]
		let level_keys_length = level_keys.length;


		let j = 0;
		let i = 0;
		let selection = { "ambito": null, "subambito": null, "mejora": null };
		let level_val= null;
		let dic_ambitos_key = null;
		
		for(j; j < level_keys_length; j++){
			level_val = +values[level_keys[j]]; // string to number		
			i = 0;
			
			if(level_keys[j] != "mejora"){
				
				dic_ambitos_key = level_keys[j] + "_id";
				//console.log('dic_ambitos_key', dic_ambitos_key);
	
				for( i; i < dic_ambitos_length; i++ ){
					//console.log('dic[i]', dic[i][dic_key]);
					
					//console.log('typeOf', typeof(level_val), level_val, level_keys[j] );
					if(+level_val != 0){
						
						if(+dic_ambitos[i][dic_ambitos_key] === +level_val){
							
							selection[level_keys[j]] = dic_ambitos[i][level_keys[j] + "_short_name"];
						}
					}
					if(+level_val === 0 || level_val === null){
							selection[level_keys[j]] = "Todos los " + level_keys[j] + "s";
					}
				} // --> for i
				
			} // if
			
			if(level_keys[j] === "mejora"){
				
				for( i; i < dic_mejoras_length; i++ ){
					//console.log('dic[i]', dic[i][dic_key]);
					
					//console.log('typeOf', typeof(level_val), level_val, level_keys[j] );
						
						if(+dic_mejoras[i].id === +level_val){
							
							selection[level_keys[j]] = dic_mejoras[i].nombre;
						}
					
				} // --> for i

				
			} // if
			
		} // for j
		

		
		
		
				// console.log('level_val', level_val, dic_key);
		// WE ARE HERE
		// console.log('level_val', selection);
		return selection;
		
		
		
	}
	
	function draw_the_select_info(obj, level){
		// console.log('draw_the_select_info obj', obj);
		
		return obj[level];
		
	}
	
	let results_partial = null;
	/**** --- DRAW MAIN DIV TABLES  ***/

	function draw_table(data, select_values, dic){
		// data: todos los datos para hacer el nest
		// select_values: los valores seleccionados en los selects - {ambito: "0", subambito: "0", mejora: "6"}  - 
		// dic: el diccionario de ambitos
		
		console.log('draw_table', data, select_values, dic);
		
		let nested_data = d3.nest()
            .key(function(d) {
                return d["cod"];
            })
            .entries(data)
            .sort(function(a,b) { return d3.ascending(a.values[0].capacidad_dos,b.values[0].capacidad_dos); });
		
		// let nested_data_length = nested_data.length;	
		
		console.log('draw_table nested_data', nested_data, nested_data.length);
		
		// Global result_partials
		results_partial = get_results_numbers(nested_data, dic);
		console.log('draw_table results_partial', results_partial);
		let select_info = get_the_select_info(select_values, dic); 
		
		// let values_counter = check_mejoras(nested_data[0]);
		let table_container = d3.select('#table_container');
		
		
		
		// actions
		draw_result_numbers(results_partial, 'total');
		table_container.selectAll("*").remove().exit();
		
		let table_main = table_container
			.selectAll('div')
			.data(nested_data)
			.enter()
			.append('div')			
			.attr('class', 'col-sm-12 col-md-6 col-lg-12 table-row-parent')
			.attr('data-name', function(d,i){
				
				return addAttrDataName_to_row(d.values[0].capacidad_uno);
				
			});
		table_main
			.html(function(d, i){
				// console.log('d', d);
				return '<div class="table-row table-border--gray padding-box--regular">'+
	                  '<div class="cell type first-child">'+
	                     '<p><i ' + addClass_to_bullet(d.values[0].capacidad_uno) + '</i> <span>&nbsp;' + d.values[0].capacidad_dos + '</span></p>'+
	                     '<div class="icon-map-container hidden-mobile">&nbsp;<img class="icon-map" src="./img/icons/icon-' + d.values[0].provincia.toLowerCase() + '.svg" /></div>'+
	                  '</div>'+
	                  '<div class="cell title">'+
	                     '<p class="title-name"><span>' + d.values[0].titulo + '</span></p>'+
	                     '<div class="univ-container">'+
	                        '<div class="univ-name">'+
	                           '<p class="margin-bottom--0"><i class="fa">&#xf19c;</i><span>&nbsp;' + d.values[0].univ + '</span></p>'+
	                           '<p class="margin-bottom--0"><i class="fa">&#xf19d;</i><span>&nbsp;' + d.values[0].centro + '</span></p>'+
	                           '<p class="margin-bottom--0">' + getEmailInfo(d.values[0]) + '</p>' +
	                           '<p class="hidden-screen"><i class="fa">&#xf041;</i>&nbsp;' + d.values[0].loc + '.</p>'+
	                        '</div>'+
	                        '<div class="univ-logo">'+
	                           '<a href="'+ d.values[0].univ_url + '" target="_blank"><img class="icon-univ-logo" src="./img/univ/'+ d.values[0].univ_short_name + '-color.png" /></a>'+
	                        '</div>'+
	                     '</div>'+
	                     '<div class="univ-links">'+
	                        '<span class="univ-links-ver hidden-mobile"><i class="fa">&#xf0d7;</i><a href="javascript:void(0);" id="link_' + i + '">&nbsp;Ver más</a></span>'+
	                        '<span class="univ-links-web">' + checkWebInfo(d.values[0].web) + ' target="_blank">&nbsp;Sitio web</a></span>'+
	                     '</div>'+
	                  '</div>'+
	                  '<div class="cell star star_i_d"><span class="star-text--container hidden-screen">I+D</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "i_d")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_produccion"><span class="star-text--container hidden-screen">Producción</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "produccion")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_suministro_y_compras"><span class="star-text--container hidden-screen">Suministros y compras</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "suministro_y_compras")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_almacenamiento_y_logistica"><span class="star-text--container hidden-screen">Almacenamiento y logística</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "almacenamiento_y_logistica")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_marketing"><span class="star-text--container hidden-screen">Marketing</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "marketing")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_ventas"><span class="star-text--container hidden-screen">Ventas</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "ventas")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_servicios"><span class="star-text--container hidden-screen">Servicios</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "servicios")  + '">&#xf005;</i></span></div>'+
	                  '<div class="cell star star_administracion"><span class="star-text--container hidden-screen">Administración</span><span class="star-icon--container"><i class="fa star-icon ' + addClass_to_star(d, "administracion")  + '">&#xf005;</i></span></div>'+
	               '</div>'+
	               '<div class="table-outside-section hidden-mobile hidden" id="more_' + i + '">'+
	               		'<p><i class="fa">&#xf0eb;</i>&nbsp;' + draw_the_select_info(select_info, 'ambito') + ' | ' + draw_the_select_info(select_info, 'subambito') + ' | ' + draw_the_select_info(select_info, 'mejora') +'</p>'+
		               '<p>' + d.values[0].desc + '</p>'+
		               '<p><i class="fa">&#xf041;</i>&nbsp;' + d.values[0].loc + '.</p>'+
		               
	               '</div>';
			});

				
	}
	




	/**** --- TABLE KEYS controller: table-keys  ***/
	
	
	function  init_table_keys(){
		
		//console.log('wellcome from init_table_keys');
		let keys = d3.selectAll('.table-keys--key');
		
		keys.on('click', function(){
			// console.log('init_table_keys', this.id, this.parentNode.parentNode);
			let key_id = this.id;
			let parent = this.parentNode.parentNode;
			let table_rows = d3.selectAll('.table-row-parent').filter(function(d){
				let attr_name = d3.select(this).attr('data-name');
				//console.log("d", d, d3.select(this).attr('data-name'));
				return attr_name === key_id;
			});
			// console.log('init_table_keys table_rows', table_rows);
			d3.select(parent).classed("table-key--active", d3.select(parent).classed("table-key--active") ? false : true);
			
			if(!d3.select(parent).classed("table-key--active")){
				// console.log('table-key--active', "active");
				table_rows.classed('hidden', true);
			}else{
				table_rows.classed('hidden', false);
			}
		});
		
	};

	


















	
	
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
		
	    build_selects(gune, dic);

		let element = document.getElementById('ambito_select');
		element.dispatchEvent(new Event("change")); 




		init_table_keys();
	    //draw_table(gune, {ambito: "1", subambito: "1", mejora: "0"}, dic);
	    init_ver_mas();
	    // draw_collapsible_tree(gune);
	    
	    
	    

        //console.log('data:: ', _4GUNE_DATA);
        // console.log('dictionary:: ', dictionary.ambitos);

        //console.log('gunePorCentro:: ', JSON.stringify(gunePorCentro));
        // console.log('gunePorCentro:: ', gunePorCentro);


		

    }	// --> init ends            

})(window, d3);