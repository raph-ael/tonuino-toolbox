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

                let $row = track_table.renderRow(track);

                track_table.$tbody.append($row);

            });
        }

    },

    renderRow: (track) => {
        return $(`
            <tr>
                <td>` + track.file + `</td>
                <td>` + track.name + `</td>
                <td>` + track.artist + `</td>
                <td>` + track.track + `</td>
            </tr>
        `);
    }

};

module.exports = track_table;