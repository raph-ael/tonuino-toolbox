const path = require('path');
const { app, BrowserWindow, ipcMain, protocol, dialog, globalShortcut, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const template = require('./menu');

let mainWindow, dialogWindow, workerWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function sendWindowMessage(targetWindow, message, payload) {
  if(typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }
  targetWindow.webContents.send(message, payload);
}

const registerProtocols = () => {

  protocol.registerFileProtocol('coverart', (request, callback) => {
    const url = request.url.split('coverart://')[1].trim();
    callback({
      path: path.normalize(app.getPath('userData') + '/coverart/' + url)
    });

  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  protocol.interceptFileProtocol('static', (request, callback) => {
    const url = request.url.split('static://')[1].trim();
    callback({ path: path.normalize(`${__dirname}/static/${url}`)})
  }, (err) => {
    if (err) console.error('Failed to register protocol')
  })

};

const setMainMenu = () => {

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu)

};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: true,
    webPreferences: { nodeIntegration: true },
    show: false,
    hasShadow: true,
    devTools: false
  });

  mainWindow.setAppl

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {

    mainWindow.show();
  });

  //mainWindow.webContents.openDevTools();

  workerWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true }
  });

  //workerWindow.webContents.openDevTools();

  workerWindow.loadFile('worker.html');

  ipcMain.on('command-from-window', (event, arg) => {
    sendWindowMessage(workerWindow, 'command-from-window', arg);
  });

  ipcMain.on('answer-from-worker', (event, arg) => {
    sendWindowMessage(mainWindow, 'answer-from-worker', arg);
  });


  /*
   * Main Window Actions
   */
  ipcMain.on('mainwindow-action', (event, action) => {

    switch (action) {

      case 'close':
        app.exit(0);
        break;

      case 'minimize':
        mainWindow.minimize();
        break;

      case 'maximize':
        if(mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        }
        else {
          mainWindow.maximize();
        }

        break;

    }

  });

  /*
   * mp3 chooser dialog
   */
  ipcMain.on('open-mp3-chooser', async () => {
    let files = await dialog.showOpenDialogSync(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{
        name: 'MP3 Dateien',
        extensions: ['mp3']
      }],
      buttonLabel: 'Kopieren'
    });
    if(files !== undefined) {
      mainWindow.webContents.send('mp3s-choosed', files);
    }

  });

  /*
   * Status Meldungen
   */
  ipcMain.on('status-message', async (event, arg) => {

    mainWindow.webContents.send('status-message', arg);

  });
};

const createWindowDialog = () => {

  dialogWindow = new BrowserWindow({
    width: 350,
    height: 240,
    frame: false,
    webPreferences: { nodeIntegration: true },
    show: false,
    modal: true,
    parent: mainWindow,
    resizable: false
  });

  dialogWindow.loadFile('dialog.html');

  ipcMain.on('open-dialog', (event, arg) => {
    dialogWindow.webContents.send('open-dialog', arg);
    dialogWindow.show();
  });

  ipcMain.on('answer-from-dialog', (event, arg) => {
    console.log(arg);
    dialogWindow.hide();
    mainWindow.webContents.send('answer-from-dialog', arg);
  });

};

const initAutoUpdater = () => {

  ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  mainWindow.webContents.on('did-finish-load', () => {

    setTimeout(() => {

      console.log('check for updates');
      autoUpdater.checkForUpdatesAndNotify();

    }, 5000);
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  registerProtocols();
  createWindow();
  createWindowDialog();
  initAutoUpdater();
  setMainMenu();

  globalShortcut.register('Control+Shift+I', () => {
    return false;
  });


});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
