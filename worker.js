const filesystem = require("./worker/filesystem");

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const api_router = require("./worker/api_router");

api_router.init();
filesystem.init();
