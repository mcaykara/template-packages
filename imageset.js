const fs = require("fs");
const path = require("path");
const srcFolder = "sign-up/images/iOS";
const distFolder = "sign-up/images/temp";
const iamgeNameRegex = /\w+(@(\dx)){0,1}/g;
var imagesets = {};
var specialFolders = {
    "Default": "LaunchImage.launchimage",
    "Icon": "AppIcon.appiconset"
};
var files = fs.readdirSync(srcFolder);
files.forEach(f => { // gruoping images
    iamgeNameRegex.lastIndex = 0;
    var res = iamgeNameRegex.exec(f),
        setName;
    if (!res)
        return;
    setName = res[1] ? res[0].replace(res[1], "") : res[0];
    if (imagesets[setName]) {
        imagesets[setName].push({
            "filename": f,
            "scale": res[2] || "1x"
        });
    }
    else {
        imagesets[setName] = [{
            "filename": f,
            "scale": res[2] || "1x"
        }];
    }
});
fs.mkdirSync(distFolder);
Object.keys(imagesets).forEach(item => { // move images
    var imageFiles = imagesets[item];
    var distFolderImageset = path.join(distFolder, specialFolders[item] || (item + ".imageset"));
    fs.mkdirSync(distFolderImageset);
    imageFiles.forEach(file => {
        copyFile(path.join(srcFolder, file.filename), path.join(distFolderImageset, file.filename));
    });
    createContentsJSON(imageFiles, distFolderImageset);
    console.log("created ", distFolderImageset);
});
deleteFolderRecursive(srcFolder);
fs.rename(distFolder, srcFolder, function() {});
function createContentsJSON(files, outputFolder) {
    var json = {
        "images": [],
        "info": {
            "version": 1,
            "author": "smartface"
        }
    };
    files.forEach(file => {
        json.images.push(Object.assign({}, file, {
            "idiom": "universal"
        }));
    });
    fs.writeFile(path.join(outputFolder, "Contents.json"), JSON.stringify(json, null, "\t"), "utf-8");
}
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
function copyFile(src, dest) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
}