const electron = require('electron');
const path = require('path');
const crypto = require('crypto')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require("fs").promises
const appdata = app.getPath("appData")
let mainWindow = null;
let tray
app.allowRendererProcessReuse = false

function createTray() {
    contextMenu = electron.Menu.buildFromTemplate([
        { label: '終了', role: 'quit' }
    ]);
    tray = new electron.Tray(path.join(__dirname, "icon.ico"));
    tray.setToolTip("Clip Gallary");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
        mainWindow.show()
    })
}
let iTimer = 0

function createWindow() {

    electron.globalShortcut.register('Alt+I', async() => {
        nt = (new Date).getTime()
        if ((nt - iTimer) < 500) {
            if (electron.clipboard.readText().length) {
                tray.displayBalloon({ icon: path.join(__dirname, "icon.ico"), title: "画像ではありません。", content: "画像をコピーしてもう一度お試し下さい。" })
            } else {
                img = electron.clipboard.readImage().toPNG()
                hash = crypto.createHash('md5').update(img).digest('hex');
                await fs.writeFile(path.join(appdata, "clip-gallary/" + hash + ".png"), img)


                data = JSON.parse(await fs.readFile(path.join(appdata, "clip-gallary/data.json")))
                data.push({
                    "src": hash + ".png",
                    "time": (new Date()).getTime()
                })
                await fs.writeFile(path.join(appdata, "clip-gallary/data.json"), JSON.stringify(data))
                mainWindow.webContents.send("update")
                tray.displayBalloon({ icon: path.join(__dirname, "icon.ico"), title: "画像を保存しました。", content: `${path.join(appdata, "clip-gallary/" + hash + ".png")}に保存しました。` })

            }
        } else {
            iTimer = nt
        }

    })
    mainWindow = new BrowserWindow({
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'pages/index.js'),
            enableRemoteModule: true
        },
        icon: path.join(__dirname, "icon.ico")
    });
    if (!tray) {
        createTray()
    }
    try {
        require("@electron/remote/main").initialize()
    } catch {}
    mainWindow.loadURL('file://' + __dirname + '/pages/index.html');
    mainWindow.on('close', event => {
        if (app.quitting) {
            mainWindow = null
        } else {
            event.preventDefault()
            mainWindow.hide()
        }
    });
}
app.on('ready', createWindow);
app.on('before-quit', () => app.quitting = true)