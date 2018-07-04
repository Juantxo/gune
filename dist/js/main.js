(function(window) {
    'use strict';
    // Handle dependencies
    window.onload = function() {
		console.log("window loaded, navigator ready");
	    init();
    };
	
	const $body = $("body");
	const $svg = $("svg#svg", $body);
	//console.log('svg', $svg);
	
	let init = function init(){
        init_json();
        init_scroll();
        init_sidenav();
        init_line_buttons();
        init_member_buttons();
	}; // ends INIT
	
	
	let init_sidenav = function(){
		
        let $close_button 	= $("#close_button", $body);
        let $open_button 	= $("#open_button", $body);
        let $side_nav 		= $("#side_nav", $body);
        
		
		let openNav = function(event) {
			console.log('openNav', event);
			$($side_nav ).stop().animate({left: 0, opacity:1}, 200);
			 		
		    //$side_nav.css( "width", "250" );
		}
		
		
		let closeNav = function(event) {
			console.log('close', event);
			$($side_nav ).stop().animate({left: -250, opacity:0}, 200);
			
			
		    //$side_nav.css( "width", "0" );
		}
		
		
        $($open_button).on('click', function(){
	        openNav();
        });
		
        $($close_button).on('click', function(){
	        closeNav();
        });
		
		
		
	};

	let init_line_buttons = function(){
        const $line_one = $("#lineOne", $svg);
        const $line_two = $("#lineTwo", $svg);
        const $line_three = $("#lineThree", $svg);
        const $line_four = $("#lineFour", $svg);
        const $line_five = $("#lineFive", $svg);
        const $line_six = $("#lineSix", $svg);
        const $line_seven = $("#lineSeven", $svg);
        const lines = [$line_one, $line_two, $line_three, $line_four, $line_five, $line_six, $line_seven];
        const $line_buttons = $("#ul-line-buttons", $body);
		
        $(lines).each(function(index, element) {
            $(element).addClass('line-active');
        });

        $($line_buttons).on('click', 'span.line', function(event) {
            event.preventDefault();
			event.stopPropagation();
            console.log('this', $( this ).attr('id') );
            // console.log('this', $( this ).data( "line" ) );

            const datum = $(this).data("line");
            console.log('datum', datum);

            if ($(this).attr('id') === "lineAll_button") {
                $('span.line', $line_buttons).parent().removeClass('line-button-inactive').addClass('line-button-active');
                $(lines).each(function(index, element) {
                    $(element).removeClass('line-inactive').addClass('line-active');
                    $('html, body').animate({
                        scrollTop: $('#Front').offset().top
                    }, 500);


                });
            } else {
                $('span.line', $line_buttons).parent().removeClass('line-button-active').addClass('line-button-inactive');
                $(this).parent().removeClass('line-button-inactive').addClass('line-button-active');

                $(lines).each(function(index, element) {
                    $(element).removeClass('line-active').addClass('line-inactive');
                });
                $('#' + datum).removeClass('line-inactive').addClass('line-active');

                $('html, body').animate({
                    scrollTop: $('#' + datum).offset().top
                }, 500);
            }
        });

	};  // ends init_line_buttons
	
    let init_member_buttons = function() {

        const $line_one_foro = $("#lineOneForo", $svg);
        const $line_two_foro = $("#lineTwoForo", $svg);
        const $line_three_foro = $("#lineThreeForo", $svg);
        const $line_four_foro = $("#lineFourForo", $svg);
        const $line_five_foro = $("#lineFiveForo", $svg);
        const $line_six_foro = $("#lineSixForo", $svg);
        const $line_seven_foro = $("#lineSevenForo", $svg);
        const lines_foro = [$line_one_foro, $line_two_foro, $line_three_foro, $line_four_foro, $line_five_foro, $line_six_foro, $line_seven_foro];

        $(lines_foro).each(function(index, element) {
            $(element).addClass('foro-active');
        });

        const $line_one_mapi = $("#lineOneMapi", $svg);
        const $line_two_mapi = $("#lineTwoMapi", $svg);
        const $line_three_mapi = $("#lineThreeMapi", $svg);
        const $line_four_mapi = $("#lineFourMapi", $svg);
        const $line_five_mapi = $("#lineFiveMapi", $svg);
        const $line_six_mapi = $("#lineSixMapi", $svg);
        const $line_seven_mapi = $("#lineSevenMapi", $svg);
        const lines_mapi = [$line_one_mapi, $line_two_mapi, $line_three_mapi, $line_four_mapi, $line_five_mapi, $line_six_mapi, $line_seven_mapi];
        const $member_buttons = $("#ul-members-buttons", $body);

        $(lines_mapi).each(function(index, element) {
            $(element).addClass('mapi-active');

        });


        $($member_buttons).on('click', 'p.line', function(event) {
            event.preventDefault();
			event.stopPropagation();
            //console.log('p.line', $(this));
            //console.log('this', $(this).attr('id'));
            //console.log('this', $( this ).data( "line" ) );

            if ($(this).attr('id') === "allMembers_button") {
                $('p.line', $member_buttons).parent().removeClass('member-button-inactive').addClass('member-button-active');
                $('.line-active .foro-inactive').removeClass('foro-inactive').addClass('foro-active');
                $('.line-active .mapi-inactive').removeClass('mapi-inactive').addClass('mapi-active');
            } else {
                $('p.line', $member_buttons).parent().removeClass('member-button-active').addClass('member-button-inactive');
                $(this).parent().removeClass('member-button-inactive').addClass('member-button-active');

                if ($(this).attr('id') === "foro_button") {

                    $('.line-active .mapi-active').removeClass('mapi-active').addClass('mapi-inactive');
                    $('.line-active .foro-inactive').removeClass('foro-inactive').addClass('foro-active');

                }
                if ($(this).attr('id') === "mapi_button") {

                    $('.line-active .foro-active').removeClass('foro-active').addClass('foro-inactive');
                    $('.line-active .mapi-inactive').removeClass('mapi-inactive').addClass('mapi-active');
                }

            }

        });
		// not in use
		$('.dot.facturacion').attr('data-toggle', 'tooltip').attr('title', ' ');
	}; // ends init_member_buttons


	let init_scroll = function(){
        // ===== Scroll to Top ==== 
        $(window).scroll(function() {
            if ($(this).scrollTop() >= 50) { // If page is scrolled more than 50px
                $('#return-to-top').fadeIn(200); // Fade in the arrow
            } else {
                $('#return-to-top').fadeOut(200); // Else fade out the arrow
            }
        });
        $('#return-to-top').click(function() { // When arrow is clicked
            $('body,html').animate({
                scrollTop: 0 // Scroll to top of body
            }, 500);
        });
		
	}; // ends init_scroll
	

	let init_json = function() {
		
		let $tooltip 			= $('#myTooltip', $body);
		let $tooltip_circle 	= $('#tooltip_circle', $tooltip);
		let $tooltip_nombre_CB 	= $('#tooltip_nombre_CB', $tooltip);
		let $tooltip_fundacion 	= $('#tooltip_fundacion', $tooltip);

		function getTheObjectFromId(arr, _id){
			
			let a = arguments[0];
			let k = arguments[1];
			// console.log('a, k', a, k);
			let aL = a.length;
			let i= 0;
			let obj = null;
			
			for (i; i< aL; i++){
				
				if(a[i].name_ID === k){
					obj = a[i];
				}
							
			}
			console.log('obj from getTheObjectFromId ', obj);
			return obj;
			
		}	// ends getTheObjectFromId

		
		function init_tooltip(data){

			$($body).on('mouseenter', '.dot.facturacion', function(event) {		  
		        // console.log('body dot facturacion HOVER', $(this), $("#myTooltip"));
				let left 					= event.pageX + 5;
				let top 					= event.pageY + 5;
				let $id 					= $(this).parent().attr('id');
				let tooltip_objectFromId 	= getTheObjectFromId(data, $id);
				let logo_white 				= './img/logos/' + tooltip_objectFromId.logo_white;
				let nombre_CB				= tooltip_objectFromId.nombre_CB;
				let color 					= '#' + tooltip_objectFromId.color;
				let fundacion 				= tooltip_objectFromId.fundacion;
		        // console.log('id', $id, tooltip_objectFromId);
		        
				$($tooltip_circle).animate({
				    opacity: 0
				}, 50, function() {
				    // Callback
				    $($tooltip_circle)
				    	.css("background-image", "url(" + logo_white + ")")
				    	.css("background-color", color)
				    	.promise().done(function(){
					        // Callback of the callback :)
					        $(this).animate({
					            opacity: 1
					        }, 100)
						});    
					});		        
		        
		        $($tooltip_nombre_CB).text(nombre_CB);
		        $($tooltip_fundacion).text(fundacion);
				$($tooltip).css({top: top,left: left}).show();		        
		        
		        
			});
		

			$($body).on('mouseout', '.dot.facturacion', function(event) {
					$($tooltip_circle)
				    	.css("background-image", "none")
				    	.css("background-color", 'transparent')
				    	.css("opacity", 0);
					$($tooltip).hide();
						        
			});

			
		}// ends init_tooltip
		
		function init_modal(data){
			let $modal_miembro_logo 					= 	$('#modal_miembro_logo');
			let $modal_miembro 							= 	$('#modal_miembro');
			let $modal_nombre_CB 						= 	$('#modal_nombre_CB');
			let $modal_logo_original 					= 	$('#modal_logo_original');
			let $modal_fundacion 						= 	$('#modal_fundacion');
			let $modal_marca_principal_CB 				= 	$('#modal_marca_principal_CB');
			let $modal_facturacion_wording 				= 	$('#modal_facturacion_wording');
			let $modal_paises_wording 					= 	$('#modal_paises_wording');
			let $modal_site 							= 	$('#modal_site');
			let $modal_foro_info 						= 	$('#modal_foro_info');

	        // ===== Body Modal Window ==== 
	
	        $($body).on('click', '.dot.facturacion', function(event) {
		        event.stopPropagation();
		        event.preventDefault();
		        // console.log('body dot facturacion', $(this), $("myModalFullscreen"));
		        
		        let $id 						= $(this).parent().attr('id');
		        //console.log('id', $id);
		        let modal_objectFromId 			= getTheObjectFromId(data, $id);
				let miembro_logo 				= modal_objectFromId.miembro === "Foro de Marcas" ? "foro" : "mapi";
				let miembro_logo_src 			= './img/' + miembro_logo + '-small.svg';
				let modal_miembro 				= modal_objectFromId.miembro;
				let nombre_CB 					= modal_objectFromId.nombre_CB;
				let modal_logo_original_src		= './img/logos/' + modal_objectFromId.logo_original;
				let modal_fundacion 			= modal_objectFromId.fundacion;
				let modal_marca_principal_CB 	= modal_objectFromId.marca_principal_CB;
				let modal_facturacion_wording 	= modal_objectFromId.facturacion_wording;
				let modal_paises_wording 		= modal_objectFromId.paises_wording;
				let modal_site 					= modal_objectFromId.site;
				let modal_foro_info 			= modal_objectFromId.foro_info;
				let modal_foro_info_title 		= 'Ir al ' + modal_miembro;

				//console.log('miembro_logo', miembro_logo);
				$($modal_miembro_logo).attr("src", miembro_logo_src);
		        $($modal_miembro).html(modal_miembro);
		        $($modal_nombre_CB).html(nombre_CB);
				$($modal_logo_original).attr("src", modal_logo_original_src);
				$($modal_fundacion).html(modal_fundacion);
				$($modal_marca_principal_CB).html(modal_marca_principal_CB);
				$($modal_facturacion_wording).html(modal_facturacion_wording);
				$($modal_paises_wording).html(modal_paises_wording);
				$($modal_site).attr("href", modal_site);
				$($modal_site).attr("title", nombre_CB);
				$($modal_foro_info).attr("href", modal_foro_info);
				$($modal_foro_info).attr("title", modal_foro_info_title);
				
		        $("#myModalFullscreen").modal();
		        
		        
		        });
			
		} // ends init_modal	

		$.getJSON( "./data/foro.json", function( flatData ) {
		  // console.log('data', flatData);
		  
		  var data = flatData.filter(function(d){return d.id > 7;})
		  // console.log('data', data);
		  
		  init_tooltip(data);	
		  init_modal(data);	
		}); // ends GETJSON
	};	// ends init_json
	
    console.log('window ends', window)


}(window));