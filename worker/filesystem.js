const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const util = require('util');
const helper = require("../helper");
const mm = require('musicmetadata');
const { ipcRenderer } = require('electron');
const electron = require('electron');
const rimraf = require('rimraf');

const readdir = util.promisify(fs.readdir);

const metadata = util.promisify(mm);

let filesystem = {

    path_data: null,
    path_user: null,
    path_coverart: null,

    init: async () => {
        filesystem.path_data = electron.remote.app.getPath('appData');
        filesystem.path_user = electron.remote.app.getPath('userData');
        filesystem.path_coverart = path.join(filesystem.path_user, 'coverart');
        if (!await fs.existsSync(filesystem.path_coverart)) {
            await fs.mkdirSync(filesystem.path_coverart);
        }
    },

    list: async (fullpath) => {

        let files = [];
        try {
            files = await readdir(fullpath);
        } catch (err) {
            console.log(err);
        }
        if (files === undefined) {
            console.log('undefined');
        } else {
            files.sort();

            return files;
        }

        return false;

    },

    getAllMp3FromFolder: async (fullpath, options) => {

        if(options === undefined) {
            options = {};
        }
        if(options.status === undefined) {
            options.status = false;
        }

        let files = [];
        let mp3s = [];
        try {
            files = await readdir(fullpath);
        } catch (err) {
            console.log(err);
        }
        if (files === undefined) {
            console.log('undefined');
        } else {
            files.sort();
            await helper.asyncForEach(files, async (file) => {

                if(!fs.lstatSync(path.join(fullpath, file)).isDirectory()) {

                    let type;
                    try {
                        type = await FileType.fromFile(path.join(fullpath, file));
                    }
                    catch (e) {
                        console.error('get filetype error');
                        console.error(e);
                    }

                    if (type !== undefined && type.ext === 'mp3') {

                        let track = {
                            name: file,
                            file: file,
                            path: path.join(fullpath, file),
                            track: '',
                            album: '',
                            artist: ''
                        };

                        let meta;
                        try {
                            meta = await metadata(fs.createReadStream(path.join(fullpath, file)));
                        }
                        catch (e) {
                            console.error('get metadata error');
                            console.error(e);
                        }

                        if(meta) {
                            console.log(meta.title);
                            if(meta.title !== undefined) {
                                track.name = meta.title;
                            }
                            if(meta.artist !== undefined && meta.artist.length > 0) {
                                track.artist = meta.artist.join(',');
                            }
                            if(meta.track !== undefined && meta.track.no !== undefined && parseInt(meta.track.no) > 0) {
                                track.track = meta.track.no;
                            }
                            if(meta.album !== undefined) {
                                track.album = meta.album;
                            }
                        }

                        /*
                         * sende status an main
                         */
                        if(options.status) {

                            let message = '';
                            if(options.status_text !== undefined) {
                                message = options.status_text + ' ';
                            }
                            message += file + '<br>' + track.name + ' - ' + track.artist;

                            ipcRenderer.send('status-message', {
                                message: message
                            });
                        }

                        mp3s.push(track);
                    }
                }

            });

            return mp3s;

        }

        return false;

    },

    copyMp3sToFolder: async (files, folder) => {

        let out = [];

        let i = 0;

        await helper.asyncForEach(files, async (file) => {

            i++;

            /*
             * sende status an main
             */
            ipcRenderer.send('status-message', {
                message: '(' + i + '/' + files.length + ') Kopiere ' + path.basename(file)
            });

            let new_number = await filesystem.getNextFreeFileNumber(folder.path);
            let new_filename = ('000' + new_number).slice(-3) + '.mp3';
            let new_path = path.join(folder.path, new_filename);

            try {
                await fs.copyFileSync(file, new_path);
            }
            catch (e) {
                console.log('Fehler copy mp3', file + ' => ' + new_path);
            }


            out.push(new_path);

        });

        return out;

    },

    getNextFreeFileNumber: async (path) => {
        let files;

        try {
            files = await readdir(path);
        } catch (err) {
            console.log(err);
        }
        if (files === undefined) {
            console.log('undefined');
        } else {

            files.sort();

            let highest_number = 0;

            await helper.asyncForEach(files, async (file) => {
                if(file.indexOf('.mp3') !== -1) {
                    let number = parseInt(file.split('.mp3')[0]);
                    if(number > highest_number) {
                        highest_number = number;
                    }
                }
            });

            return (highest_number+1);

        }
    },

    getFirstAlbumArtCover: async (fullpath, foldername) => {

        let files;

        try {
            files = await readdir(fullpath);
        } catch (err) {
            console.log(err);
        }
        if (files === undefined) {
            console.log('undefined');
        } else {

            files.sort();

            let image = null;

            await helper.asyncForEach(files, async (file) => {
                if(file.indexOf('.mp3') !== -1) {

                    if(!image) {
                        let meta;
                        try {
                            meta = await metadata(fs.createReadStream(path.join(fullpath, file)));
                        }
                        catch (e) {
                            console.log('Fehler Metadata', e);
                        }


                        if(meta && meta.picture && meta.picture.length > 0) {

                            let imagename;
                            try {
                                imagename = foldername + '.' + meta.picture[0].format;

                                await fs.writeFileSync(path.join(filesystem.path_coverart, imagename), meta.picture[0].data);

                                image = imagename;

                            } catch (err) {
                                console.log('Fehler albumart', err);
                                image = null;
                            }
                        }
                    }
                }
            });

            return image;
        }
    },

    newFolder: async (fullpath) => {

        let files;

        try {
            files = await readdir(fullpath);
        } catch (err) {
            console.log(err);
        }
        if (files === undefined) {
            console.log('undefined');
        } else {

            files.sort();

            let next_free_folder_number = 0;
            let next_free_folder_name = '01';

            for(let i=1;i<100;i++) {

                /*
                 * wenn Ordner nicht existiert erstellen und schleife abbrechen
                 */
                next_free_folder_name = ('00'+i).slice(-2);
                if(files.indexOf(next_free_folder_name) === -1) {
                    next_free_folder_number = i;
                    i=101;
                }

            }

            await fs.mkdirSync(path.join(fullpath, next_free_folder_name));

            let folder = {
                name: next_free_folder_name,
                artists: [],
                albums: [],
                folder_name: next_free_folder_name,
                title: [],
                type: 'other',
                filetype: null,
                path: path.join(fullpath, next_free_folder_name),
                image: null
            };

            return folder;

        }
    },

    removeAll: async (fullpath) => {

        return await rimraf.sync(fullpath);

    },

    /*
     * Sortiert mp3s in einem Ordner nach 001.mp3 002.mp3 ...
     */
    mp3Sorter: async (fullpath) => {

        let mp3s = await filesystem.list(fullpath);

        mp3s.sort();

        let i = 0;

        await helper.asyncForEach(mp3s, async (mp3) => {

            i++;

            let should_filename = ('000' + i).slice(-3) + '.mp3';

            if(mp3 !== should_filename) {
                try {
                    await fs.renameSync(path.join(fullpath, mp3), path.join(fullpath, should_filename));
                }
                catch (e) {
                    console.error('file_sort rename error');
                    console.error(e);
                }
            }
        });
    }
};

module.exports = filesystem;