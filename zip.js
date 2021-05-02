function getLength(txt) {
    var length = 0;
    for (var i = 0; i < txt.length; i++) {
        var c = txt.charCodeAt(i);
        if ((c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            length += 1;
        } else {
            length += 2;
        }
    }
    return length;
};
async function main() {
    const fs = require('fs');
    const path = require('path');
    const glob = require("glob")

    const archiver = require('archiver');
    fs.copyFileSync(`zip/readme.txt.bak`, `zip/readme.txt`)
    json = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), "utf8"))
    const title = `Clipboard-Gallary ${json.version}`
    readme_txt = fs.readFileSync(path.join(__dirname, 'zip/readme.txt'), "utf8")
    readme_txt = readme_txt.replace("!title_equal", "=".repeat(getLength(title))).replace("!title", title)
    fs.copyFileSync(`zip/readme.txt`, `zip/readme.txt.bak`)
    fs.writeFileSync(path.join(__dirname, 'zip/readme.txt'), readme_txt)
        // readme_md = fs.readFileSync(path.join(__dirname, 'zip/readme.md'), "utf8")
        // readme_md.replace("!title_equal", "=".repeat(getLength(title)))
        // readme_md.replace("!title", title)
    exePath = glob.sync(path.join(__dirname, 'dist/*.exe')).pop()

    exeName = exePath.split("/").pop()
    const zipPath = `${exeName.slice(0,-4)}.zip`;
    const output = fs.createWriteStream(path.join(__dirname, "outputs/" + zipPath));

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.pipe(output);
    fs.copyFileSync(exePath, `zip/${exeName}`)
    archive.glob('*', { ignore: "**/*.bak", cwd: 'zip/' });
    await archive.finalize();



    var archive_size = archive.pointer();
    console.log(`Complete: ${archive_size} bytes`);
    fs.unlinkSync(path.join(__dirname, `zip/${exeName}`))
}
(async() => {
    await main();
})();