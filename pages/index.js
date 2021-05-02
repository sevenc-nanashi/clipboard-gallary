function onload() {
    const electron = require("electron")
    const fs = require("fs").promises
    const path = require("path")
    const remote = require('@electron/remote')
    const appdata = remote.app.getPath("appData")
    document.getElementById("sys-min").addEventListener("click", function(e) {
        var window2 = remote.getCurrentWindow();
        window2.minimize();
    });

    document.getElementById("sys-close").addEventListener("click", function(e) {
        var window2 = remote.getCurrentWindow();
        window2.close();
    });
    document.querySelectorAll("a").forEach(e => {
        e.addEventListener("click", ev => {
            ev.preventDefault()
            electron.shell.openExternal(e.href)
        })
    })

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function deleteEntry(event) {
        img = this.parentElement.querySelector(".entry-date")
        data = JSON.parse(await fs.readFile(path.join(appdata, "clip-gallary/data.json")))
        data = data.filter(d => { return d["time"] != img.getAttribute("raw") })
        await fs.writeFile(path.join(appdata, "clip-gallary/data.json"), JSON.stringify(data))
        loadData()
    }
    async function copyEntry(event) {
        await electron.clipboard.writeImage(electron.nativeImage.createFromPath(this.src.replace(/^file:\/\/\//, "")))
    }

    function main() {
        loadData()
    }
    async function loadData() {
        await fs.mkdir(path.join(appdata, "clip-gallary")).catch(() => {})

        let rawData
        rawData = await fs.readFile(path.join(appdata, "clip-gallary/data.json")).catch(async() => {
            await fs.writeFile(path.join(appdata, "clip-gallary/data.json"), "[]")
        })
        if (rawData) {
            data = JSON.parse(rawData)
        } else {
            data = []
        }
        if (data.length) {
            document.getElementById("no-entries").style.display = "none"
            document.getElementById("entries").querySelectorAll(".entry").forEach(e => e.delete())
            data.forEach(d => {
                template = document.getElementById("entry-template")
                clone = template.content.cloneNode(true);
                clone.querySelector("img").src = path.join(appdata, "clip-gallary/" + d["src"])
                date = new Date(d["time"])
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                m = date.toISOString().match(/(?<year>\d+)-(?<month>\d+)-(?<date>\d+)T(?<hour>\d+):(?<minute>\d+):(?<second>\d+)\.(?<mili>[\d.]+)Z/).groups
                clone.querySelector(".entry-date").innerText = `${m.year}/${m.month}/${m.date} ${m.hour}:${m.minute}`
                clone.querySelector(".entry-date").setAttribute("raw", d["time"])
                clone.querySelector(".entry-delete").addEventListener("click", deleteEntry)
                clone.querySelector(".entry-img").addEventListener("click", copyEntry)
                document.getElementById("entries").appendChild(clone)
            })
        } else {
            document.getElementById("entries").innerHTML = ""
            document.getElementById("no-entries").style.display = "block"
        }

    }
    main()

    electron.ipcRenderer.on("update", () => {
        loadData()
    })
}
document.addEventListener("DOMContentLoaded", onload)