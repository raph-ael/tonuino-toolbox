const filesystem = require("./filesystem");
const electron = require('electron');
const { ipcRenderer } = require('electron');
const devices = require("./devices");
const path = require('path');
const mp3_id3_editor = require('./mp3_id3_editor');

let api_router = {

    init: () => {

        ipcRenderer.on('command-from-window', (event, arg) => {

            if(api_router[arg.command] !== undefined) {

                api_router[arg.command](arg.params, (answer) => {

                    /*
                     * sende antwort an das fenster über den main prozess
                     */
                    ipcRenderer.send('answer-from-worker', {
                        command: arg.command, answer: answer
                    });

                });
            }
        });
    },

    ping: (params, callback) => {

        callback('pong');

    },

    list_devices: async (params, callback) => {

        let drives = await devices.list();

        callback(drives);

    },

    list_all: async (params, callback) => {

        let folders_and_files = await devices.listAll(params.drive);

        callback(folders_and_files);

    },

    add_files: async (params, callback) => {

        let copied_files = await filesystem.copyMp3sToFolder(params.files, params.folder);

        params.folder.title = await filesystem.getAllMp3FromFolder(params.folder.path);

        params.folder.image = await filesystem.getFirstAlbumArtCover(params.folder.path, params.folder.folder_name);

        let folder_names = await devices.getNamesFromTracks(params.folder.title);
        params.folder.artists = folder_names.artists;
        params.folder.albums = folder_names.albums;

        callback({
            folder: params.folder
        });

    },

    new_folder: async (params, callback) => {

        let folder = await filesystem.newFolder(params.drive.path);

        callback(folder);

    },

    purge_device: async (params, callback) => {

        await devices.purge(params.drive);

        callback(true);

    },

    remove_folder: async (params, callback) => {

        await filesystem.removeAll(path.join(params.drive.path, params.folder.folder_name));

        callback(true);

    },

    tag_edit: async (params, callback) => {

        console.log(params);
        let success = await mp3_id3_editor.updateTag(params.file_path, params.tag_name, params.value);
        callback(success);

    }

};

module.exports = api_router;