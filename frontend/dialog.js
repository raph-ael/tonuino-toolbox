const { ipcRenderer } = require('electron');

let dialog = {

    callback: null,

    init: () => {

        ipcRenderer.on('answer-from-dialog', (event, arg) => {

            console.log(dialog.callback);
            if(dialog.callback) {
                dialog.callback(arg);
                dialog.callback = null;
            }
        });

    },

    open: (options, callback) => {

        dialog.callback = null;

        if(callback !== undefined) {
            dialog.callback = callback;
        }

        ipcRenderer.send('open-dialog', options);

    }

};

module.exports = dialog;