let folder_list = {

    $list: null,
    $btn_remove_folder: null,

    init: () => {
        folder_list.$list = $('#folder-list');
        folder_list.$btn_remove_folder = $('#btn-remove-folder');
        folder_list.setTitle('Ordner');
    },

    setTitle: (title) => {
        folder_list.$list.find('li.title').remove();
        folder_list.$list.prepend('<li class="title"><h5 class="nav-group-title">' + title + '</h5></li>');
    },

    appendTitle: (title) => {
        folder_list.$list.append('<li class="title"><h5 class="nav-group-title">' + title + '</h5></li>');
    },

    setFolders: (folders) => {

        folder_list.$list.empty();

        folder_list.appendTitle(folders.tonuino_folder.length + ' Tonuino Ordner');
        folders.tonuino_folder.forEach((folder) => {
            folder_list.$list.append(folder_list.renderTonuinoFolder(folder));
        });

        folder_list.appendTitle(folders.tonuino_system.length + ' Tonuino System-Ordner');
        folders.tonuino_system.forEach((folder) => {
            folder_list.$list.append(folder_list.renderSystemFolder(folder));
        });

        if(folders.other.length > 0) {
            folder_list.appendTitle('Sonstige Ordner & Dateien');
            folders.other.forEach((folder) => {
                folder_list.$list.append(folder_list.renderOther(folder));
            });
        }
    },

    renderTonuinoFolder: (folder) => {

        let title = folder.name;
        if(folder.albums.length > 0) {
            title = folder.albums.join(', ');
        }

        if(folder.artists.length > 0) {
            title += '<br>' + folder.artists.join(', ');
        }

        let image_src = 'static://img/cover_placeholder.png';
        if(folder.image) {
            image_src = 'coverart://' + folder.image;
        }

        let $li = $(`
            <li class="list-group-item list-folder-tonuino list-folder-tonuino-` + folder.folder_name + `">
            <img class="media-object pull-left" src="` + image_src + `" width="52" height="52">
            <div class="media-body">
              <strong>` + folder.folder_name + `</strong> <span class="pull-right">` + folder.title.length + ` Titel</span>
              <p>` + title + `</p>
            </div>
          </li>
        `);

        $li.click(() => {
            folder_list.$list.find('.active').removeClass('active');
            $li.addClass('active');
            theapp.setFolder(folder);
        });

        return $li;

    },

    activateFolder: (folder_name) => {

        let $li = folder_list.$list.find('.list-folder-tonuino-' + folder_name);
        folder_list.$list.parent().scrollTop(0);
        folder_list.$list.parent().scrollTop($li.position().top);
        $li.trigger('click');

    },

    activateLast: () => {
        folder_list.$list.find('.list-folder-tonuino').last().trigger('click');
    },

    activateFirst: () => {
        folder_list.$list.find('.list-folder-tonuino').first().trigger('click');
    },

    removeFolder: (folder) => {
        folder_list.$list.find('.list-folder-tonuino-' + folder.folder_name).remove();
    },

    replaceFolder: (folder) => {
        folder_list.$list.find('.list-folder-tonuino-' + folder.folder_name).replaceWith(folder_list.renderTonuinoFolder(folder));
    },

    addFolder: (folder, type) => {
        console.log(folder);
        if(folder_list.$list.find('.list-folder-tonuino').length > 0) {
            folder_list.$list.find('.list-folder-tonuino').last().after(folder_list.renderTonuinoFolder(folder));
        }
        else {
            folder_list.$list.find('.title').first().after(folder_list.renderTonuinoFolder(folder));
        }

    },

    renderSystemFolder: (folder) => {

        let title = folder.name;

        if(title === 'mp3') {
            title = 'Tonuino Sprachansagen';
        }

        return $(`
            <li class="list-group-item">
            <img class="media-object pull-left" src="http://via.placeholder.com/32x32" width="32" height="32">
            <div class="media-body">
              <strong>` + folder.folder_name + `</strong>
              <p>` + title + `</p>
            </div>
          </li>
        `);
    },

    renderOther: (folder) => {

        let title = folder.name;

        return $(`
            <li class="list-group-item">
            <img class="media-object pull-left" src="http://via.placeholder.com/32x32" width="32" height="32">
            <div class="media-body">
              <strong>` + folder.folder_name + `</strong>
              <p>` + title + `</p>
            </div>
          </li>
        `);
    }

};

module.exports = folder_list;