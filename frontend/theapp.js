const { ipcRenderer } = require('electron');
const electron = require('electron');

let theapp = {

    $page: null,
    $page_loader: null,
    $pane_main: null,
    $pane_main_loader: null,
    device: null,
    folder: null,
    $btn_group_right: null,
    $btn_group_folder_opt: null,
    $header: null,
    $app_version: null,
    path_user: null,
    path_data: null,

    init: () => {

        theapp.$app_version = $('#app_version');
        theapp.$page = $('#fullpage');
        theapp.$page_loader = $('#fullpage-loader');
        theapp.$pane_main = $('#main-pane');
        theapp.$pane_main_loader = $('#main-pane-loader');
        theapp.$btn_group_right = $('#btn-add-files');
        theapp.$btn_group_folder_opt = $('#btn-group-folder-options');
        theapp.$header = $('#fullpage > header');
        theapp.$status_message = theapp.$pane_main_loader.find('.status-message');

        /*
         * App Version setzen
         */
        theapp.$app_version.text(electron.remote.app.getVersion());

        /*
         * pfade
         */
        theapp.path_data = electron.remote.app.getPath('appData');
        theapp.path_user = electron.remote.app.getPath('userData');

        /*
         * init message service
         */
        msg.init();

        /*
         * init auto update
         */
        autoupdate.init();

        /*
         * initialisiere window action buttons
         */
        window_actions.init();

        /*
         * initialisiere worker api
         */
        worker_api.init();

        /*
         * Order-UI initialisieren
         */
        folder_list.init();

        /*
         * Track-UI initialisieren
         */
        track_table.init();

        /*
         * init file add button
         */
        add_files.init();

        /*
         * dropdown
         */
        dropdowns.init();

        /*
         * Neuer Ordner Button
         */
        new_folder.init();

        /*
         * SD Karte säubern Button
         */
        purge.init();

        /*
         * Dialog Fenster
         */
        dialog.init();

        /*
         * Ordner lösche Button
         */
        remove_folder.init();

        /*
         * link zur website
         */
        about_link.init();

        /*
         * init device selector
         */
        theapp.showMainLoader();
        theapp.hideFullpageLoader();
        device_select.init(() => {
            /*
             * autodetect sdcard
             */
            theapp.hideMainLoader();
        });

        /*
         * listen for status messages
         */
        ipcRenderer.on('status-message', (event, arg) => {
            theapp.$status_message.html(arg.message);
        });


    },

    showMainLoader: () => {
        theapp.$status_message.text('');
        theapp.$pane_main.hide();
        theapp.$pane_main_loader.show();
    },

    hideMainLoader: () => {
        theapp.$pane_main.show();
        theapp.$pane_main_loader.hide();
    },

    showFullpageLoader: () => {
        theapp.$page_loader.css('display', 'table');
        theapp.$page.hide();
    },

    hideFullpageLoader: () => {
        theapp.$page_loader.css('display', 'none');
        theapp.$page.show();
    },

    setDevice: (device) => {
        theapp.device = device;
        if(device) {
            theapp.$btn_group_folder_opt.show();
        }
        else {
            theapp.$btn_group_folder_opt.hide();
        }
    },


    reload: (callback) => {
        theapp.showMainLoader();
        worker_api.command('list_all', {
            data: {
                drive: theapp.device
            },
            success: (folder) => {
                folder_list.setFolders(folder);
                theapp.hideMainLoader();
                if(callback !== undefined) {
                    callback();
                }

                device_select.reload();

            }
        });
    },

    updateFileProperty: (file_path, tag_data) =>{

        theapp.folder.title.forEach((file) => {
            if(file.path === file_path) {
                console.log('update data!!');
                console.log(tag_data);
                console.log(file);

                file.track = tag_data.trackNumber;
                file.name = tag_data.title;
                file.album = tag_data.album;
                file.artist = tag_data.artist;

            }
        });

    },

    setFolder: (folder) => {
        theapp.folder = folder;
        track_table.setFolder(folder);
        if(folder) {
            theapp.$btn_group_right.show();
            folder_list.$btn_remove_folder.show();
        }
        else {
            theapp.$btn_group_right.hide();
            folder_list.$btn_remove_folder.hide();
        }
    },

    setMp3sForFolder: (mp3s) => {
        if(theapp.folder) {
            theapp.folder.title = mp3s;
        }
    }

};

module.exports = theapp;