let remove_folder = {
    $btn: null,
    init: () => {

        remove_folder.$btn = $('#btn-remove-folder');

        remove_folder.$btn.click(() => {

            dialog.open({
                title: theapp.folder.folder_name + ' löschen',
                message: 'Wirklich löschen?',
                detail: 'Möchtest Du den Ordner ' + theapp.folder.folder_name + ' wirklich löschen? Der Vorgang kann nicht rückgängig gemacht werden.',
                buttons: ['Nein, lieber doch nicht', 'Ja, Ordner löschen']
            }, (response) => {

                if(response.answer === 2) {

                    worker_api.command('remove_folder', {
                        data: {
                            drive: theapp.device,
                            folder: theapp.folder,
                        },
                        success: (response) => {
                            folder_list.removeFolder(theapp.folder);
                            folder_list.activateFirst();
                        }
                    });

                }

            });

        });

    }
};

module.exports = remove_folder;