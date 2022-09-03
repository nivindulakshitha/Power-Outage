const { app, BrowserWindow, Notification, ipcMain, Tray, Menu } = require("electron");
const path = require('path');

var window = undefined;
var tray;
var isQuiting;

function createWindow() {
    window = new BrowserWindow({
        width: 360,
        height: 520,
        resizable: false,
        icon: path.join(__dirname, "fevi.ico"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    window.setMenu(null);
    window.setTitle("Power Cut Schedule")
    window.loadFile('./sources/index.html');
    window.webContents.openDevTools();
    window.on('close', function (event) {
        if (!isQuiting) {
            event.preventDefault();
            window.hide();
            event.returnValue = false;
        }
    });

    window.on('minimize', function (event) {
        event.preventDefault();
        window.hide();
    });
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('ready', () => {
    tray = new Tray('fevi.ico');

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Open App', click: function () {
                window.show();
            }
        },
        {
            label: 'Quit', click: function () {
                isQuiting = true;
                app.quit();
            }
        }
    ]));
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('notify', async (e, body) => {
    new Notification({
        title: 'Power Cut Schedule', body: body, icon: path.join(__dirname, 'fevi.ico'),
        urgency: 'critical'
    }).show()
});