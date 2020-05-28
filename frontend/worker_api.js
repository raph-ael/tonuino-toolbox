const { ipcRenderer } = require('electron');

const COMMAND_STATUS_READY = 1;

let worker_api = {

    running_commands: {},

    init: () => {

        ipcRenderer.on('answer-from-worker', (event, arg) => {

            if(worker_api.running_commands[arg.command] !== undefined) {
                worker_api.running_commands[arg.command].success(arg.answer);
                delete worker_api.running_commands[arg.command];
            }
        });

    },

    command: (name, options) => {

        let params = {};
        if(options.data !== undefined) {
            params = options.data;
        }

        /*
         * erstelle object mit status
         */
        worker_api.running_commands[name] = {
            status: 0,
            params: params,
            success: () => {  }
        };

        /*
         * was passiert on success
         */
        if(options.success !== undefined) {
            worker_api.running_commands[name].success = options.success;
        }

        /*
         * sende commando an den worker über den main prozess
         */
        ipcRenderer.send('command-from-window', {
            command: name, params: params
        });
    }

};

module.exports = worker_api;