//const dialog = require('electron').remote.dialog;
const { BrowserWindow } = require('electron').remote;

let purge = {

    $btn: null,

    init: () => {

        purge.$btn = $('#btn-purge');

        purge.$btn.click(async () => {

            dialog.open({
                title: 'SD-Karte säubern',
                buttons: ['Nein, doch nicht', 'SD-Karte säubern'],
                message: 'Bist Du Dir Sicher?',
                detail: 'Diese Aktion wird alle Ordner und mp3 Dateien neu Sortieren. Alles was nichts auf der SD Karte zu suchen hat wird ohne Rückfrage gelöscht.'
            }, (response) => {

                if(response.answer === 2) {
                    worker_api.command('purge_device',{
                        data: {
                            drive: theapp.device
                        },
                        success: () => {
                            theapp.showMainLoader();
                            theapp.reload(() => {
                                theapp.hideMainLoader();
                            });
                        }
                    });
                }

            });

            /*
             * Button 1 wurde geklickt
             */


        });

    }

};

module.exports = purge;