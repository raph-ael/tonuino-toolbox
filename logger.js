const { ipcRenderer } = require('electron');
const filelogger = require('electron-log');

const logger = {

    log: async (...args) => {

        console.log(filelogger.transports.file.getFile().path);

        for (let i = 0; i < args.length; i++) {

            await logger.sendMessage(args[i], 'info');
            await filelogger.log(args[i]);
        }
    },

    warn: async (...args) => {
        for (let i = 0; i < args.length; i++) {
            await logger.sendMessage(args[i], 'info');
            await filelogger.warn(args[i]);
        }
    },

    error: async (...args) => {
        for (let i = 0; i < args.length; i++) {
            await logger.sendMessage(args[i], 'info');
            await filelogger.error(args[i]);
        }
    },

    sendMessage: async (message, type) => {



    }

};

module.exports = logger;