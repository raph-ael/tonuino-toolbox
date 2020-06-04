var fileUrl = require('file-url');

let track_table = {

    $table: null,
    $tbody: null,
    mp3_file: false,
    $tr_playing: null,
    playing_file: null,

    init: () => {

        track_table.$table = $('#track-table');
        track_table.$tbody = track_table.$table.find('tbody');

    },

    reload: () => {
        track_table.setFolder(theapp.folder);
    },

    setFolder: (folder) => {

        track_table.$tbody.empty();

        if(folder) {
            folder.title.forEach((track) => {

                let $row = track_table.renderRow(track, folder);

                track_table.$tbody.append($row);

            });

            /*
             * add mp3 player
             */
            track_table.$tbody.find('.btn-stop-mp3').click(async (ev) => {

                ev.preventDefault();
                let $el = $(ev.currentTarget);
                let $tr = $el.parent().parent();
                let file_path = $tr.data('path');
                track_table.playing_file = null;
                $tr.removeClass('is-playing');

                if(track_table.$tr_playing) {
                    track_table.$tr_playing.removeClass('is-playing');
                    if(track_table.mp3_file !== false) {
                        track_table.mp3_file.pause();
                        track_table.mp3_file.currentTime = 0;
                    }
                }

            });

            track_table.$tbody.find('.btn-play-mp3').click(async (ev) => {

                ev.preventDefault();
                let $el = $(ev.currentTarget);
                let $tr = $el.parent().parent();
                let file_path = $tr.data('path');

                if(track_table.$tr_playing) {
                    track_table.$tr_playing.removeClass('is-playing');
                }

                if(track_table.mp3_file !== false) {
                    track_table.mp3_file.pause();
                    track_table.mp3_file.currentTime = 0;
                }

                track_table.mp3_file = new Audio(fileUrl(file_path));
                track_table.mp3_file.play();
                track_table.playing_file = file_path;
                track_table.mp3_file.onended = () => {

                    track_table.playing_file = null;

                    if(track_table.$tbody.find('tr').length > 1) {
                        if($tr.next().is('tr')) {
                            $tr.next('tr').find('.btn-play-mp3').trigger('click');
                        }
                        else {
                            $tr.parent().find('tr').first().find('.btn-play-mp3').trigger('click');
                        }
                    }
                };

                $tr.addClass('is-playing');
                track_table.$tr_playing = $tr;




            });

            /*
             * add edit functionality
             */
            track_table.$tbody.find('.editable').click((ev) => {
                ev.preventDefault();
                let $el = $(ev.currentTarget);
                if(!$el.hasClass('edit-mode')) {
                    $el.addClass('edit-mode');
                    let value = $el.text();
                    let file_path = $el.data('path');
                    let tag_name = $el.data('tag');

                    let $input = $('<input type="text" value="" />');
                    $el.css({
                        width: $el.outerWidth()+'px'
                    });
                    $input.css({
                        width: $el.width()-2+'px',
                        padding: '0',
                        height: '19px'
                    });
                    $input.val(value);
                    $el.empty();
                    $el.append($input);

                    let submitEditMode = () => {
                        let new_value = $input.val();

                        let removeEditMode = () => {
                            $el.empty();
                            $el.text(new_value);
                            $el.removeClass('edit-mode');
                            $el.prop('style', null);
                        };

                        if(new_value !== value) {
                            $el.html('<span class="icon icon-arrows-ccw fa fa-spin"></span>')
                            worker_api.command('tag_edit',{
                                data: {
                                    file_path: file_path,
                                    tag_name: tag_name,
                                    value: new_value
                                },
                                success: (response) => {
                                    if(response !== false) {
                                        removeEditMode();
                                        theapp.updateFileProperty(file_path, response);
                                    }
                                    else {
                                        new_value = value;
                                        removeEditMode();
                                    }
                                }
                            });
                        }
                        else {
                            removeEditMode();
                        }
                    };

                    $input.keypress((e) => {
                        if (e.which === 13) {
                            submitEditMode();
                            return false;
                        }
                    });
                    $input.select();

                    $input.blur((ev) => {
                        submitEditMode();
                    });
                }
            });
            track_table.$tbody.find('.editable').each((i, el) => {
                let $el = $(el);
            });
        }

    },

    renderRow: (track, folder) => {
        let $tr = $(`
            <tr data-path="` + track.path + `">
                <td><button class="btn btn-mini btn-default btn-play-mp3"><span class="icon icon-play"></span></button><button class="btn btn-mini btn-default btn-stop-mp3"><span class="icon icon-stop"></span></button></td>
                <td>` + track.file + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="title">` + track.name + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="artist">` + track.artist + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="album">` + track.album + `</td>
                <td class="editable" data-path="` + track.path + `"  data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="trackNumber">` + track.track + `</td>
            </tr>
        `);

        if(track.path === track_table.playing_file) {
            $tr.addClass('is-playing');
        }

        return $tr;
    }

};

module.exports = track_table;