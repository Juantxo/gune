!(function(window, d3) {

    'use strict';


    let url_img = '../../img/';
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

	function nest_tree_data(data){
        
        let nested_tree_data = d3.nest()
            .key(function(d) {
                return d.centro;
            })
            //.key(function(d) { return d.capacidad_uno; })
            .key(function(d) {
                return d.capacidad_dos;
            })
            .key(function(d) {
                return d.cod;
            })

            //.rollup(function(v) { return v.length; }) 
            // rollup takes the array of values for each group and it produces a value based on that array
            .entries(data);
        
        return nested_tree_data;     
		
	}







    /**** --- NEST DATA: data nest for list ***/

    function nest_list_data(data) {

        let nested_list_data = d3.nest()
            .key(function(d) {
                return d["cod"];
            })
            .entries(data)
            .sort(function(a, b) {
                return d3.ascending(a.values[0].capacidad_dos, b.values[0].capacidad_dos);
            });

        return nested_list_data;


    }

    function get_dictionary_obj(dic, key_to_check, value_to_check) {
        //console.log('get_dictionary_property', dic, key_to_check, value_to_check, key_to_return);
        const dic_length = dic.length;
        let i = 0;
        let result = null;

        for (i; i < dic_length; i++) {

            if (dic[i][key_to_check] === value_to_check) {
                result = dic[i];
            }
        }
        // console.log('get_dictionary_obj', result);
        return result;



    }

    function get_dictionary_property(dic, key_to_check, value_to_check, key_to_return) {
        //console.log('get_dictionary_property', dic, key_to_check, value_to_check, key_to_return);
        const dic_length = dic.length;
        let i = 0;
        let result = null;

        for (i; i < dic_length; i++) {

            if (dic[i][key_to_check] === value_to_check) {
                result = dic[i][key_to_return];
            }
        }
        // console.log('get_dictionary_property', result);
        return result;


    }




    function get_capacidad_obj(select, dic) {

        //console.log('get_capacidad_obj', id, dic);
        let temp = dic.filter(function(d) {
            //console.log('d', d.parent_id);
            return +d.parent_id === +select.capacidad_uno;

        });
        //console.log('temp', temp);
        temp.unshift({
            id: 0,
            capacidad_dos: "Todos los tipos",
            json: "todos",
            capacidad_uno: "Todas",
            parent_id: 0
        });

        //console.log('get_capacidad_obj temp', temp);
        return temp;
    }

	function get_filter_data(data, select_values, dic){
		//console.log('get_filter_data', data, select_values, dic);
		let selection_names = get_the_select_info(select_values, dic)[0];
		//console.log('get_filter_data selection_names', selection_names);
		
		let c1_obj = data.filter(function(d, i){
			
			if(select_values.capacidad_uno != 0 ){ return d.capacidad_uno === selection_names.capacidad_uno; } 
			else { return d; }
			
		});
		//console.log('get_filter_data c1_obj', c1_obj);
		
		let c2_obj = c1_obj.filter(function(d, i){
			
			if(select_values.capacidad_dos != 0 ){ return d.capacidad_dos === selection_names.capacidad_dos; } 
			else { return d; }
			
		});
		
		//console.log('get_filter_data c2_obj', c2_obj);
		
		let a1_obj = c2_obj.filter(function(d, i){
			
			if(select_values.ambito != 0 ){ return +d.ambito_id === +select_values.ambito; } 
			else { return d; }
			
		});
		
		let a2_obj = a1_obj.filter(function(d, i){
			
				if(d.presencia != 0 ){ return d; } 
			
		});


			
				//console.log('get_filter_data a2_obj', a2_obj);
		
		//Para contador y árbol	 -- COUNT DATA and TREE DATA for nest	
		return a2_obj;
		
	}
	
	
	function draw_counter(d){
		
		let nest_data_counter =  nest_list_data(d);
		let nest_data_counter_l = nest_data_counter.length;
		let results_total = d3.select('#results_total').html(nest_data_counter_l);
		
		
		if(!nest_data_counter_l){
			$("#NoDataModalFullscreen").modal(); //TODO
		}		

		//console.log('draw_counter nest_data_counter', nest_data_counter);
	}
    /**** --- BUILD SELECTS ***/



    function build_selects(data, dic) {

        //console.log('building selects.....');
        const dic_capacidad_uno = dic.capacidades.capacidades_uno;
        const dic_capacidad_dos = dic.capacidades.capacidades_dos;
        const dic_ambitos = dic.industria_4.ambitos;
        //console.log('building selects', dic_capacidad_uno, dic_capacidad_dos, dic_ambitos);


        const capacidad_uno_select = d3.select('#capacidad_uno_select').on('change', onchange);
        const capacidad_dos_select = d3.select('#capacidad_dos_select').on('change', onchange);
        const ambito__select = d3.select('#ambito_select').on('change', onchange); // now doing nothing! only log values


        function updateSelect() {

            return {

                capacidad_uno: capacidad_uno_select.property('selectedOptions')[0].value,
                capacidad_dos: capacidad_dos_select.property('selectedOptions')[0].value,
                ambito: ambito__select.property('selectedOptions')[0].value

            };
        }




        function onchange() {

            let capacidad_dos_obj = null;

            selectValues = updateSelect();
            capacidad_dos_obj = get_capacidad_obj(selectValues, dic_capacidad_dos);




            if (this.dataset.select === "capacidad_uno_select") {
                // console.log('enter onchange parent select....');
                // console.log('this.dataset.select', this.dataset.select);
                // console.log('onchange this.value', this.value);

                let options = capacidad_dos_select
                    .selectAll('option')
                    .remove()
                    .exit()
                    .data(capacidad_dos_obj)
                    .enter()
                    .append('option')
                    .each(function(d, i) {
                        //console.log('dd, ii', d, i);
                        if (i === 0) {
                            d3.select(this).attr('selected', 'selected');
                        }
                        /*
                        if( d.subambito_id === +select_subambito + 1){
                        	d3.select(this).attr('selected', 'selected');
                        }
                        */
                    })

                    .attr('value', function(d) {
                        //console.log('d.subambito_id', d.subambito_id, d); 
                        return d.id ? d.id : '0';
                    })
                    .text(function(d) {
                        // console.log('option', d);
                        return d.capacidad_dos;
                    });
                // console.log('options', options);
                selectValues = updateSelect();
                



            } //  --> if ends

            //console.log('onchange capacidad_dos_obj', capacidad_dos_obj);


            show_selected_titles(selectValues, dic);
            draw_title_selector(get_the_select_info(selectValues, dic));
			init_counter(data,selectValues, dic);
			
			if(tree_counter){
				selectValues = updateSelect();
				//draw_title_selector(get_the_select_info(selectValues, dic));
				//console.log('tree_counter ON CHANGE selectValues', selectValues);
				init_overall_tree(data, selectValues, dic);
					
			}// if(tree_counter) ENDS
			

            //console.log('selectValues', selectValues);
            
				jump("jump_banner");
            
            



        }//  --> Onchange ends
        
        


    }


    function draw_title_selector(select_obj) {
        // console.log('select_obj', select_obj);
        
        
        if(select_obj[1].ambito_id === 0){
			d3.select('#title_img').attr("src", url_img + 'icons/icon-capacidad-black@2x.png');
        }else{
			d3.select('#title_img').attr("src", url_img + 'ambitos/icon_ambito_' + select_obj[1].ambito_id + '@2x.png');
        }
        d3.select('#title_ambito').html(select_obj[0].capacidad_uno);
        d3.select('#title_subambito').html(select_obj[0].capacidad_dos);
        d3.select('#title_mejora').html(select_obj[0].ambito);
        return '';

    }

    function show_selected_titles(select_values, dic) {

        let c1 = +select_values.capacidad_uno;
        let c2 = +select_values.capacidad_dos;
        let a1 = select_values.ambito;

        let select_values_names = get_the_select_info(select_values, dic)[0];
        // console.log('show_selected_titles c1, c2, a1', c1, c2, a1, select_values_names);


        let capacidades = get_capacidad_obj(select_values, dic.capacidades.capacidades_dos);
        let capacidadesL = capacidades.length;
        var j = 0;
        //console.log('capacidades', capacidades);
        let all_rows = d3.selectAll('.table-row-parent');
        let c1_rows;
        let c2_rows;
        let a1_rows = null;

        //console.log('all_rows', all_rows);
		// si no son todas las capacidades
        if (capacidadesL > 1) {
	        // escondemos todas los títulos
            all_rows.classed('hidden', true);
            
             // Filtramos los títulos que tienen la capacidad_uno
            c1_rows = all_rows.filter(function(d, i) {
                j = 0;
                //console.log('all_rows.filter d', d);
                for (j; j < capacidadesL; j++) {

                    if ( j > 0 ) {

                        if (d.values[0].capacidad_uno === capacidades[j].capacidad_uno) { return d; }
                    }
                }
            });
			
			 // Filtramos los títulos que tienen la capacidad_dos
            c2_rows = c1_rows.filter(function(d, i) {
                // console.log('c2_rows d', d);
                if ( c2 === 0 ) { return d; }
                if ( d.values[0].capacidad_dos === select_values_names.capacidad_dos ) { return d; };
            });
            c2_rows.classed('hidden', false);


            //console.log('c1_rows', c1_rows);
            // console.log('c2_rows', c2_rows);
            //console.log('a1_rows', a1_rows);
        } else {
            all_rows.classed('hidden', false);
            c1_rows = all_rows;
            c2_rows = all_rows;
        }

		// Filtramos los ámbitos si la opción no son todos los ámbitos
        if ( +a1 != 0 ) {
            // console.log('+a1 != 0', a1, +a1 != 0);

            a1_rows = c2_rows.selectAll('.table-row');
            a1_rows.classed('hidden', true);

            let green_stars = d3.selectAll('.star_' + a1 + " i.star-icon--green");
            green_stars.each(function(d, i) {
                let el = this.parentNode.parentNode.parentNode;
                //console.log('green_stars el ', el);
                d3.select(el).classed('hidden', false);
            });
            //console.log('a1_rows', a1_rows, green_stars);
            //c2_rows.selectAll('.star_' + a1).classed('hidden',false);
		// Filtramos los ámbitos si la opción son todos los ámbitos
	
        }else{
            a1_rows = c2_rows.selectAll('.table-row');
            a1_rows.classed('hidden', false);
        }

    }




    function get_the_select_info(values, dic) {

        // {capacidad_uno: "1", capacidad_dos: "0", ambito: "0"}
        // console.log('get_the_select_info', values, dic);
        let selection = [{
            "capacidad_uno": null,
            "capacidad_dos": null,
            "ambito": null
        }, { "capacidad_uno_id": +values.capacidad_uno,
            "capacidad_dos_id": +values.capacidad_dos,
            "ambito_id": +values.ambito
		}];

        let dic_capacidad_uno = dic.capacidades.capacidades_uno;
        let dic_capacidad_dos = dic.capacidades.capacidades_dos;
        let dic_ambitos = dic.industria_4.ambitos;

        selection[0].capacidad_uno = +values.capacidad_uno != 0 ? get_dictionary_property(dic_capacidad_uno, "id", +values.capacidad_uno, "capacidad_uno") : 'Todas las capacidades';
        selection[0].capacidad_dos = +values.capacidad_dos != 0 ? get_dictionary_property(dic_capacidad_dos, "id", +values.capacidad_dos, "capacidad_dos") : 'Todos los tipos';
        selection[0].ambito = get_dictionary_property(dic_ambitos, "ambito_id", +values.ambito, "ambito");
        // console.log('get_the_select_info level_val', selection);
        return selection;



    }


    // TABLE FUNCTIONS

    function check_presencias(d, val) {
        //console.log('check_presencias', d, val);
        let temp = d.values;
        let tempL = d.values.length;
        let i = 0;
        let result = {

            "ambito_id": null,
            "children": 0,
            "presencias": 0,
            "subambitos": [


            ]

        };

        for (i; i < tempL; i++) {

            if (+temp[i].ambito_id === +val) {

                if (i === 0) {
                    result.ambito_id = +val;
                }
                result.children += 1;

                if (+temp[i].presencia === 1) {
                    result.presencias += 1;
                }

                result.subambitos.push({
                    "suambito_id": +temp[i].subambito_id,
                    "presencia": +temp[i].presencia
                });

            }
        }

        // console.log('check_presencias result', result);
        return result;



    }

    function addClass_to_star(d, val) {
        //console.log('addClass_to_star', d);

        let values_counter = check_presencias(d, val);
        //console.log('values_counter result', values_counter);


        let theClass = 'star-icon--gray percent-0';

        if (!!values_counter.presencias && values_counter.presencias != 0) {
            theClass = 'star-icon--green percent-' + ((values_counter.presencias * 100) / values_counter.children).toFixed(0) + " " + values_counter.presencias + "_" + values_counter.children;
        }
        return theClass;

        //return "star-icon--gray"
    }

    /*** --- Check web info ---*/
    function checkWebInfo(val) {
        //console.log('checkWebInfo',val);
        if (val.indexOf('http') != -1) {
            return '<i class="fa">&#xf13d;</i><a href="' + val + '"';
        } else {
            return '<a href="javascript:void(0);" class="hidden"';
        }
    }

    /*** --- Check email info ---*/
    function getEmailInfo(val) {
        // console.log('getEmailInfo',val);
        // <i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:example@example.com?subject=4GUNE Clúster Industria 4.0">Iñaki Vázquez</a> </span>

        let email = val.email.trim().replace('(at)', "@");
        let responsable = val.responsable.trim();
        const emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        let emailIsOk = emailRe.test(email);
        // console.log('getEmailInfo',email, emailIsOk, responsable);

        if (emailIsOk) {
            if (responsable && responsable != "NO DISPONIBLE") {
                return '<i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:' + email + '?subject=4GUNE Clúster Industria 4.0">' + responsable + '</a> </span>';
            } else {
                return '<i class="fa">&#xf0e0;</i><span>&nbsp;<a href="mailto:' + email + '?subject=4GUNE Clúster Industria 4.0">' + 'Contacto' + '</a> </span>';
            }
        }
        if (!emailIsOk) {
            if (responsable && responsable != "NO DISPONIBLE") {
                return '<i class="fa">&#xf0e0;</i><span>&nbsp;' + responsable + '</a> </span>';
            } else {
                return '';
            }
        }
    }

    function addClass_to_bullet(d) {
        //console.log('addClass_to_bullet', d);
        let bullet = 'class="fa">&#xf111;';

        switch (d) {
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
    /*
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
    */
    function init_ver_mas() {
        var x = document.getElementsByTagName("BODY")[0].addEventListener('click', function(e) {
            // do nothing if the target does not have the class drawnLine
            //if (!e.target.classList.contains("drawnLine")) return;

            if (e.target.id.indexOf("link_") > -1) {

                //console.log('e.target.dataset', e.target.dataset);
                let el = e.target;
                let temp = el.id.split('_')[1];

                let tab = d3.select('#more_' + temp)
                //console.log(temp, d3.select('#more_' + temp));
                // el.attr("class", "hidden");

                tab.classed("hidden", tab.classed("hidden") ? false : true);

                //console.log(d3.select(el).html());
                d3.select(el).html() === '&nbsp;Ver menos' ? d3.select(el).html('&nbsp;Ver más') : d3.select(el).html('&nbsp;Ver menos');

            }
        });

    }

    function draw_table(nested_list_data, dic) {

        //console.log('draw_table t', nested_list_data);
        let table_container = d3.select('#table_container');

        table_container.selectAll("*").remove().exit();


        let table_main = table_container
            .selectAll('div')
            .data(nested_list_data)
            .enter()
            .append('div')
            .attr('class', 'col-sm-12 col-md-6 col-lg-12 table-row-parent hidden')
            .attr('data-capacidad', function(d, i) {

                return d.values[0].capacidad_uno;

            })
            .attr('data-tipo', function(d, i) {

                return d.values[0].capacidad_dos;

            });

        table_main
            .html(function(d, i) {
                //console.log('addClass_to_star d', d);

                let titulo_obj = get_dictionary_obj(dic.titulos, "cod", d.values[0].cod);
                let titulo = titulo_obj.titulo;
                let bullet_class = addClass_to_bullet(d.values[0].capacidad_uno);
                let capacidad_dos = d.values[0].capacidad_dos;
                let icon_url = url_img + 'icons/icon-' + get_dictionary_property(dic.direcciones, "direccion_id", d.values[0].direccion_id, "provincia").toLowerCase();
                let centro = d.values[0].centro;
                let email = getEmailInfo(titulo_obj);
                let ubicacion_obj = get_dictionary_obj(dic.direcciones, "direccion_id", d.values[0].direccion_id);
                let ubicacion = ubicacion_obj.direccion + ', ' + ubicacion_obj.cp + ' ' + ubicacion_obj.localidad + ', ' + ubicacion_obj.provincia;
                let univ_obj = get_dictionary_obj(dic.universidades, "univ_id", d.values[0].univ_id);
                let univ = univ_obj.univ;
                let univ_url = univ_obj.univ_url;
                let univ_logo = url_img + 'univ/' + univ_obj.univ_short_name;
                let web_info = checkWebInfo(titulo_obj.web);
                let descripcion = titulo_obj.desc;



                return '<div class="table-row table-border--gray padding-box--regular">' +
                    '<div class="cell type first-child">' +
                    '<p><i ' + bullet_class + '</i> <span>&nbsp;' + capacidad_dos + '</span></p>' +
                    '<div class="icon-map-container hidden-mobile">&nbsp;<img class="icon-map" src="' + icon_url + '.svg" /></div>' +
                    '</div>' +
                    '<div class="cell title">' +
                    '<p class="title-name"><span>' + titulo + '</span></p>' +
                    '<div class="univ-container">' +
                    '<div class="univ-name">' +
                    '<p class="margin-bottom--0"><i class="fa">&#xf19c;</i><span>&nbsp;' + univ + '</span></p>' +
                    '<p class="margin-bottom--0"><i class="fa">&#xf19d;</i><span>&nbsp;' + centro + '</span></p>' +
                    '<p class="margin-bottom--0">' + email + '</p>' +
                    '<p class="hidden-screen"><i class="fa">&#xf041;</i>&nbsp;' + ubicacion + '.</p>' +
                    '</div>' +
                    '<div class="univ-logo">' +
                    '<a href="' + univ_url + '" target="_blank"><img class="icon-univ-logo" src="' + univ_logo + '-color.png" /></a>' +
                    '</div>' +
                    '</div>' +
                    '<div class="univ-links">' +
                    '<span class="univ-links-ver hidden-mobile"><i class="fa">&#xf0d7;</i><a href="javascript:void(0);" id="link_' + i + '">&nbsp;Ver más</a></span>' +
                    '<span class="univ-links-web">' + web_info + ' target="_blank">&nbsp;Sitio web</a></span>' +
                    '</div>' +
                    '</div>' +
                    '<div class="cell star star_1"><span class="star-text--container hidden-screen">Fabricación Avanzada</span><span class="star-icon--container"><i data-star="Fabricación Avanzada" class="fa star-icon ' + addClass_to_star(d, 1) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_2"><span class="star-text--container hidden-screen">RV & RA</span><span class="star-icon--container"><i data-star="RV & RA" class="fa star-icon ' + addClass_to_star(d, 2) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_3"><span class="star-text--container hidden-screen">Ciberseguridad</span><span class="star-icon--container"><i data-star="Ciberseguridad" class="fa star-icon ' + addClass_to_star(d, 3) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_4"><span class="star-text--container hidden-screen">Cloud computing</span><span class="star-icon--container"><i data-star="Cloud computing" class="fa star-icon ' + addClass_to_star(d, 4) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_5"><span class="star-text--container hidden-screen">Big Data</span><span class="star-icon--container"><i data-star="Big Data" class="fa star-icon ' + addClass_to_star(d, 5) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_6"><span class="star-text--container hidden-screen">Internet of Things</span><span class="star-icon--container"><i data-star="Internet of Things" class="fa star-icon ' + addClass_to_star(d, 6) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_7"><span class="star-text--container hidden-screen">Sistemas IT</span><span class="star-icon--container"><i data-star="Sistemas IT" class="fa star-icon ' + addClass_to_star(d, 7) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_8"><span class="star-text--container hidden-screen">Fabricación Aditiva</span><span class="star-icon--container"><i data-star="Fabricación Aditiva" class="fa star-icon ' + addClass_to_star(d, 8) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_9"><span class="star-text--container hidden-screen">Materiales & procesos</span><span class="star-icon--container"><i data-star="Materiales & procesos" class="fa star-icon ' + addClass_to_star(d, 9) + '">&#xf005;</i></span></div>' +
                    '<div class="cell star star_10"><span class="star-text--container hidden-screen">Modelos de negocio</span><span class="star-icon--container"><i data-star="Modelos de negocio" class="fa star-icon ' + addClass_to_star(d, 10) + '">&#xf005;</i></span></div>' +
                    '</div>' +
                    '<div class="table-outside-section hidden-mobile hidden" id="more_' + i + '">' +
                    '<p>' + descripcion + '</p>' +
                    '<p><i class="fa">&#xf041;</i>&nbsp;' + ubicacion + '.</p>' +

                    '</div>';
            });




    } // end DRAW TABLE

	function init_star_tooltip(){
		
		let green_star = d3.selectAll('.star-icon--green');
		let tooltip = d3.select("#star_tooltip");
		
		//console.log('green_star',green_star);
		
		
		green_star.on("mouseover", function() {
			let el = d3.select(this);
			let temp = d3.select(this.dataset)._groups[0][0].star;
							
			//console.log('d', temp);
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html(temp)
                .style("left", (d3.event.pageX - 100) + "px")		
                .style("top", (d3.event.pageY - 80) + "px");	
            })					
        .on("mouseout", function() {		
            tooltip.transition()		
                .duration(200)		
                .style("opacity", 0);	
        });			
			
	}	



    function init_table(gune, dic) {
        //console.log('init_table.....');

        let titulos = nest_list_data(gune);
        draw_title_selector(get_the_select_info({
            "capacidad_uno": 0,
            "capacidad_dos": 0,
            "ambito": 0
        }, dic));

        draw_table(titulos, dic);
        show_selected_titles({
            "capacidad_uno": 0,
            "capacidad_dos": 0,
            "ambito": 0
        }, dic);




    }


    // tree functions
	/**** --- DRAW COLLAPSIBLE TREE  ***/
	
	
	
	function get_capacidad_color(val){
		
		let colors = [
			
			{"name": "Formación", "color": "#009fdf", "json": "formacion"},
			{"name": "Investigación", "color": "#8e6aad", "json": "investigacion"},
			{"name": "Instalaciones y equipos", "color": "#e88604", "json": "instalaciones_y_equipos"},
			{"name": "Transferencia", "color": "#df503e", "json": "transferencia"}
			
			
		];	
		
		let colorsL = colors.length;
		let i = 0;
		
		for(i; i < colorsL; i++ ){
			
			if(colors[i].name === val){
				return colors[i].color;
			}
			
		}
	}
	function draw_collapsible_tree(data, select_values, dic){
		
		//console.log('draw_collapsible_tree', data.length);
        var guneTree = {
            'key': "4GUNE",
            "values": nest_tree_data(data)

        };
        
        //var guneList = nest_list_data(data);
		//results_partial = get_results_numbers(guneList);
		
		//console.log('draw_collapsible_tree results_partial', results_partial);
		//draw_result_numbers(results_partial, select_values, dic.mejoras);
        
        
        //console.log('guneTree:: ', guneTree, dic);

		


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
        
        
		d3.select("#tree_container").selectAll("*").remove().exit();

        var svg = d3.select("#tree_container").append("svg")
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

            //console.log('treeData', treeData);

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

                   // console.log('nodes d', d, d.depth);
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
	                
	               //console.log('fill', d.depth);
	                
					switch(d.depth){
						case 0:
						case 1:
							return d._children ? "#D3D3D3" : "#fff";
							break;
						case 2:
							let case_two_fill = get_capacidad_color(d.data.values[0].values[0].capacidad_uno);
							//console.log('case 2:',  d.data.key, d.data.values[0].values[0].capacidad_uno);
							return case_two_fill;
							break;
						case 3:
							let case_three_fill = get_capacidad_color(d.data.values[0].capacidad_uno);

							//console.log('case 3:',  d.data.key, d.data.values[0].capacidad_uno);
							return case_three_fill;
							break;
						default:
							return 'red';	
					} // --> end swicth
                   
                    
                })
                .style("stroke", function(d) {
					return 'rgb(0, 0, 0)';

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
	                if(d.depth === 1){ 
		                
		                let centro = get_dictionary_property(dic.centros, 'centro', d.data.key, 'centro_corto');
		                return centro;

		                //console.log('text d', d.data.key, d.depth, centro); 
		                
		             }else{
		                const reg = /^\d+$/;
		                let temp = null;
		                
		                if(reg.test(d.data.key)){
			                // console.log('numberss....');
			                temp = get_dictionary_property(dic.titulos, 'cod', +d.data.key, 'titulo_short_name');
			                return temp;
			                
		                }else{
			                return d.data.key;
		                }
		                //console.log('text d', d.data.key);


			             
		             }
					

                    
                })
                .style("fill", function(d) {
                    return 'rgb(0, 0, 0)';
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
                   
	                // console.log('fill', d.depth);
	                
					switch(d.depth){
						case 0:
						case 1:
							return d._children ? "#D3D3D3" : "#fff";
							break;
						case 2:
							let case_two_fill = get_capacidad_color(d.data.values[0].values[0].capacidad_uno);
							//console.log('case 2:',  d.data.key, d.data.values[0].values[0].capacidad_uno);
							return case_two_fill;
							break;
						case 3:
							let case_three_fill = get_capacidad_color(d.data.values[0].capacidad_uno);

							//console.log('case 3:',  d.data.key, d.data.values[0].capacidad_uno);
							return case_three_fill;
							break;
						default:
							return 'red';	
					} // --> end swicth
                   
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
                    return widthScale(d.data.depth)
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
                    return widthScale(d.data.depth)
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
                    return widthScale(d.data.depth)
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
                //console.log('click', d);

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
                if(d.depth === 3){
	              /*  
				let ubicacion_obj = get_dictionary_obj(dic.direcciones, "direccion_id", d.values[0].direccion_id);// falta
				let ubicacion = ubicacion_obj.direccion + ', ' + ubicacion_obj.cp + ' ' + ubicacion_obj.localidad + ', ' +  ubicacion_obj.provincia;
				let web_info = checkWebInfo(titulo_obj.web);
				let descripcion = titulo_obj.desc;
				*/
	                //console.log('d tree', d);
	                let cod = +d.data.key;
	                let all_values = d.data.values[0];
	                let titulo = get_dictionary_obj(dic.titulos, "cod", cod);
					let univ = get_dictionary_obj(dic.universidades, "univ_id", all_values.univ_id);
					
					//console.log(titulo.desc);

	                
	                // variables
					let capacidad_dos = all_values.capacidad_dos;
					let capacidad_color = get_capacidad_color(all_values.capacidad_uno);
					let titulo_name = titulo.titulo;
					let titulo_email = titulo.email;
					let univ_centro = all_values.centro;
					let titulo_responsable = titulo.responsable;
					let titulo_web =  titulo.web.indexOf('http') != -1 ? titulo.web : "javascript:void(0);";
					let univ_name = univ.univ;
					let univ_url = univ.univ_url;
					let email_info = getEmailInfo(titulo);
					let univ_logo = url_img + 'univ/'+ univ.univ_short_name +"-color@2x.png";
					let ubicacion_obj = get_dictionary_obj(dic.direcciones, "direccion_id", all_values.direccion_id);
					let ubicacion = ubicacion_obj.direccion + ', ' + ubicacion_obj.cp + ' ' + ubicacion_obj.localidad + ', ' +  ubicacion_obj.provincia;
					let description = titulo.desc;
						
	                 
	                 // console.log('d tree all_values, univ', all_values, univ);
	                 
	                 // assign
	                 d3.select('#capacidad_dos').html(capacidad_dos);
	                 d3.select('#capacidad_color').style("color", capacidad_color);
	                 d3.select('#titulo_name').html(titulo_name);
	                 d3.select('#univ_name').html(univ_name);
	                 d3.select('#univ_centro').html(univ_centro);
	                 // d3.select('#titulo_responsable').html(titulo_responsable);
	                 d3.select('#email_info').html(email_info);
	                 d3.select('#univ_url').attr('href', univ_url);
	                 d3.select('#univ_logo').attr('src', univ_logo);
	                 d3.select('#titulo_url').attr('href', titulo_web);
	                 d3.select('#titulo_direccion').html(ubicacion);
	                 
	                 
	                 d3.select('#titulo_description').html(description);
	                 
	                 
	                 
	                 // modal window
	                $("#myModalFullscreen").modal();
                }
            }
        } // --> update source ends
		
		
	};

	
    
    
    
    
    
    
	function init_overall_tree(gune, val, dic){
		//console.log('init_overall_tree', data, values);

		let filter_data = get_filter_data(gune, val, dic);

		//console.log('init_overall_tree filter_data', filter_data);
		
		
		if(filter_data.length){
			draw_collapsible_tree(filter_data, val, dic);
		}else{
			d3.select("#tree_container").selectAll("*").remove().exit();

			// console.log('NO DATA');
		}
		
		
		
	}
	
	function jump(h){
		//console.log(h);
		let top = document.getElementById(h).offsetTop;
		animateScrollTo(top);	
	}

	
	
	
	

    function init_pill_tabs(data, dic) {

        const pill_list_tab = d3.select('#pills-list-tab');
        const pill_tree_tab = d3.select('#pills-tree-tab');


        pill_list_tab.on('click', function() {

			tree_counter = false;
            //console.log('pill_list_tab', tree_counter);

        });

        pill_tree_tab.on('click', function() {
			tree_counter = true;

			//console.log('pill_tree_tab', tree_counter);
			
			let element = document.getElementById('ambito_select');
			element.dispatchEvent(new Event("change")); 
			

        });



    }
    function init_counter(gune, val, dic){
	    
	    let filter_data = get_filter_data(gune, val, dic);
	    
	    //console.log('init_counter filter_data', filter_data)
	    draw_counter(filter_data);
	    
    }
    


    let init = function(error, gune, dic) {
        //console.log('hello from D3', gune, dic);
        if (error) throw error;
	    
		let val = {
            "capacidad_uno": 0,
            "capacidad_dos": 0,
            "ambito": 0
        };

        build_selects(gune, dic);
        init_table(gune, dic);
		init_star_tooltip() ;      
        init_ver_mas();
        init_counter(gune, val, dic);
		init_pill_tabs(gune, dic);


    } // --> init ends            

})(window, d3);