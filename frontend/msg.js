require('jquery-toast-plugin');

let msg = {

    init: () => {

    },

    info: (message, options) => {
        msg.processMessage(message, options, 'info');
    },

    processMessage: (message, options, type) => {

        options = $.extend({},{
            text: message,
            position : 'bottom-right',
            hideAfter: false,
            showHideTransition: 'slide'
        }, options);

        $.toast(options);

    }

};

module.exports = msg;