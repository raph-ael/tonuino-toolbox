const shell = require('electron').shell;

let about_link = {

    $btn: null,

    init: () => {

        about_link.$btn = $('#about-link');

        about_link.$btn.click(() => {
            console.log('open link');
            shell.openExternal('https://geldfrei.net');
        });

    }
};

module.exports = about_link;