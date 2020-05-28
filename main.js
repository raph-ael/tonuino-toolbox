const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow, workerWindow;

console.log('start');

function sendWindowMessage(targetWindow, message, payload) {
  if(typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }
  targetWindow.webContents.send(message, payload);
}

autoUpdater.logger = log;
//autoUpdater.logger.transports.file.level = 'info';


function createWindow () {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {

    setTimeout(() => {

      console.log('check for updates');
      autoUpdater.checkForUpdatesAndNotify();

    }, 5000);
  });


  workerWindow = new BrowserWindow({
    show: true,
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true }
  });

  workerWindow.webContents.openDevTools();

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
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app-version', (event) => {
  event.sender.send('app-version', { version: app.getVersion() });
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});
