const path = require('path');
const nodeDiskInfo = require('node-disk-info');
const helper = require ("../helper");
const fs = require('fs');
const filesystem = require("./filesystem");
const { ipcRenderer } = require('electron');
const df = require('node-df');
const util = require('util');

const dfp = util.promisify(df);

let devices = {

    tonuino_system_folders: ['mp3', 'advert'],

    list: async (callback) => {

        if(helper.isWindows()) {

            return await devices.listWindows();
        }
        else {
            return await devices.listWinMac();
        }

    },

    listWinMac: async () => {

        let drives = await dfp();

        console.log(drives);

        let out = [];

        await helper.asyncForEach(drives, async (drive) => {
            if(drive.size > 1065483 && drive.filesystem.indexOf('udev') === -1 && drive.filesystem.indexOf('tmpfs') === -1) {

                let faktor = 1024;

                out.push({
                    name: drive.filesystem,
                    path: drive.mount,
                    size: drive.size*faktor,
                    free: drive.available*faktor,
                    busy: drive.used*faktor,
                    size_format: helper.bytesToSize(drive.size*faktor),
                    free_format: helper.bytesToSize(drive.available*faktor),
                    busy_format: helper.bytesToSize(drive.used*faktor)
                });

            }
        });

        return out;

    },

    listWindows: async () => {
        const drives = await nodeDiskInfo.getDiskInfoSync();

        let out = [];

        await helper.asyncForEach(drives, async (drive) => {

            if(drive.blocks > 1999136 && drive.filesystem.indexOf('udev') === -1 && drive.filesystem.indexOf('tmpfs') === -1) {
                let mount_parts = drive.mounted.split('/');
                let name = mount_parts[mount_parts.length-1]+'';
                if(name === '') {
                    name = drive.filesystem;
                }

                let faktor = 1024;
                if(helper.isWindows()) {
                    faktor = 1;
                    name += '/';
                }
                else if(helper.isMac()) {
                    faktor = 512;
                }

                out.push({
                    name: name,
                    path: drive.mounted,
                    size: drive.blocks*faktor,
                    free: drive.available*faktor,
                    busy: drive.used*faktor,
                    size_format: helper.bytesToSize(drive.blocks*faktor),
                    free_format: helper.bytesToSize(drive.available*faktor),
                    busy_format: helper.bytesToSize(drive.used*faktor)
                });
            }

        });

        return out;
    },

    listAll: async (drive, cb) => {

        let files = await filesystem.list(drive.path);

        let out = {
            tonuino_folder: [],
            tonuino_system: [],
            other: []
        };

        let i = 0;

        await helper.asyncForEach(files, async (file) => {

            i++;

            let folder = {
                name: file,
                artists: [],
                albums: [],
                folder_name: file,
                title: [],
                type: 'other',
                filetype: null,
                path: path.join(drive.path, file),
                image: null
            };

            if(fs.lstatSync(path.join(drive.path, file)).isDirectory()) {

                /*
                 * sende status an main
                 */
                let status_message = '(' + i + '/' + files.length + ') Lese Ordner ' + file + '';

                folder.filetype = 'folder';

                if (file.length === 2) {
                    folder.number = parseInt(file);
                    if (folder.number > 0) {

                        folder.image = await filesystem.getFirstAlbumArtCover(path.join(drive.path, file), file);
                        folder.type = 'tonuino_folder';
                        folder.title = await filesystem.getAllMp3FromFolder(path.join(drive.path, file),{
                            status: true,
                            status_text: status_message
                        });

                        let folder_names = await devices.getNamesFromTracks(folder.title);
                        folder.artists = folder_names.artists;
                        folder.albums = folder_names.albums;
                    }
                }

                if (devices.tonuino_system_folders.indexOf(file) !== -1) {
                    folder.type = 'tonuino_system';
                }
            }
            else {
                folder.filetype = 'file';
            }

            out[folder.type].push(folder);

        });

        return out;
    },

    getNamesFromTracks: async (tracks) => {

        let artists = [];
        let albums = [];
        await helper.asyncForEach(tracks, async (track) => {
            artists.push(track.artist);
            albums.push(track.album);
        });

        artists = await helper.arrayUnique(artists);
        albums = await helper.arrayUnique(albums);

        return {
            artists: artists,
            albums: albums
        }
    },

    purge: async (drive) => {

        let files = await filesystem.list(drive.path);

        let allowed = ['mp3', 'advert'];

        for(let i=1;i<=99;i++) {
            allowed.push(('00'+i).slice(-2))
        }

        await helper.asyncForEach(files, async (file) => {

            let current_path = path.join(drive.path, file);

            if(fs.lstatSync(current_path).isDirectory()) {

                /*
                 * wenn Ordnername nicht erlaubt ist Verzeichnis rekursiv löschen
                 */
                if(allowed.indexOf(file) === -1) {
                    await filesystem.removeAll(current_path);
                }
                /*
                 * ansonsten alle Dateien ausser mp3s im Ordner löschen
                 */
                else {
                    let mp3s = await filesystem.list(current_path);

                    await helper.asyncForEach(mp3s, async (mp3) => {

                        let file_extension = mp3.split('.').pop();

                        if(file_extension !== 'mp3') {
                            await filesystem.removeAll(path.join(current_path, mp3));
                        }

                    });

                    /*
                     * Ordner löschen wenn er leer ist
                     */
                    mp3s = await filesystem.list(current_path);
                    if(mp3s.length === 0) {
                        await filesystem.removeAll(current_path);
                    }
                    /*
                     * Mp3s sortieren, falls eine Nummer fehlt
                     */
                    else {
                        await filesystem.mp3Sorter(current_path);
                    }
                }
            }
            /*
             * wenn nicht Datei löschen
             */
            else {
                await fs.unlinkSync(current_path);
            }

        });

        await devices.folderSorter(drive.path);
    },

    /*
     * sortiert Ordner der 1. Ebene 01-99
     */
    folderSorter: async (fullpath) => {

        let folders = await filesystem.list(fullpath);

        folders.sort();

        let i = 0;

        await helper.asyncForEach(folders, async (folder) => {

            /*
             * system Ordner ausblenden
             */
            if(devices.tonuino_system_folders.indexOf(folder) === -1) {
                i++;

                let should_foldername = ('00' + i).slice(-2);

                if(folder !== should_foldername) {
                    await fs.renameSync(path.join(fullpath, folder), path.join(fullpath, should_foldername));
                }
            }
        });

        return await filesystem.list(fullpath);

    }
};

module.exports = devices;