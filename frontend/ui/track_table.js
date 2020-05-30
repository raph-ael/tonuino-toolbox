let track_table = {

    $table: null,
    $tbody: null,

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
        return $(`
            <tr>
                <td>` + track.file + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="title">` + track.name + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="artist">` + track.artist + `</td>
                <td class="editable" data-path="` + track.path + `" data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="album">` + track.album + `</td>
                <td class="editable" data-path="` + track.path + `"  data-file="` + track.file + `" data-folder="` + folder.name + `" data-tag="trackNumber">` + track.track + `</td>
            </tr>
        `);
    }

};

module.exports = track_table;