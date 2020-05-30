const isMac = process.platform === 'darwin';
const { shell } = require('electron');

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: 'Tonunino-Toolbox',
        submenu: [
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'Datei',
        submenu: [
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    // { role: 'viewMenu' }
    {
        label: 'Ansicht',
        submenu: [
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Fenster',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Repo',
                click: async () => {

                    await shell.openExternal('https://github.com/raph-ael/tonuino-toolbox/issues');
                }
            },
            {
                label: 'Problem / Bug melden',
                click: async () => {

                    await shell.openExternal('https://github.com/raph-ael/tonuino-toolbox/issues');
                }
            },
            { type: 'separator' },
            {
                label: 'About',
                click: async () => {

                    await shell.openExternal('https://geldfrei.net');
                }
            }
        ]
    }
];

module.exports = template;