const { ipcRenderer } = require('electron');

let autoupdate = {

    init: () => {

        ipcRenderer.on('update-available', () => {
            ipcRenderer.removeAllListeners('update-available');
            msg.info('Lade Update herunter...',{
                heading: 'Update Verfügbar'
            });
        });
        ipcRenderer.on('update-downloaded', () => {
            ipcRenderer.removeAllListeners('update-downloaded');

            dialog.open({
                title: 'Update installieren',
                message: 'Update jetzt installieren?',
                detail: 'Ein neues Update wurde heruntergeladen und steht jetzt bereit zur Installation. Für Die Installation wird Tonuino-Toolkit einmal neu gestartet.',
                buttons: ['Nein, jetzt nicht', 'Ja, Update jetzt installieren']
            }, (response) => {

                /*
                 * Ja Update installieren geklickt.
                 */
                if(response.answer === 2) {
                    ipcRenderer.send('restart-app');
                }

            });

        });

    }

};

module.exports = autoupdate;