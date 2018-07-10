!(function(window, d3) {

    'use strict';


    let url_img = '../../img/';
    let url_data = '../../data/';

    window.onload = function() {
        d3.queue()
            //.defer(d3.json, url_data + 'data_final_unicode.json')
            .defer(d3.json, url_data + 'dictionary.json')
            .await(init);


    };



    let init = function(error, gune, dic) {
        console.log('hello from D3', gune, dic);
        if (error) throw error;
	    

    } // --> init ends            

})(window, d3);