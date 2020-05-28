let new_folder = {

    $btn: null,

    init: () => {

        new_folder.$btn = $('#btn-create-new-folder');

        new_folder.$btn.click(() => {

            worker_api.command('new_folder', {
                data: {
                    drive: theapp.device
                },
                success: (folder) => {
                    folder_list.addFolder(folder);
                    theapp.setFolder(folder);
                    folder_list.activateFolder(folder.folder_name);

                }
            })

        });
    }

};

module.exports = new_folder;