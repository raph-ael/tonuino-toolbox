window.worker_api = require('./worker_api');
window.dialog = require('./dialog');
window.about_link = require('./ui/about_link');
window.add_files = require('./ui/add_files');
window.device_select = require('./ui/device_select');
window.dropdowns = require('./ui/dropdowns');
window.folder_list = require('./ui/folder_list');
window.new_folder = require('./ui/new_folder');
window.purge = require('./ui/purge');
window.remove_folder = require('./ui/remove_folder');
window.track_table = require('./ui/track_table');
window.window_actions = require('./ui/window_actions');
window.theapp = require('./theapp');
window.helper = require('../helper');
window.msg = require('./msg');
window.autoupdate = require('./autoupdate');

theapp.init();