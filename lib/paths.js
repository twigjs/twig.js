const FS = require('fs');

const sepChr = '/';

exports.relativePath = function (base, file) {
    let basePath = exports.normalize(base.split(sepChr));
    const newPath = [];
    let val;

    // Remove file from url
    basePath.pop();
    basePath = basePath.concat(file.split(sepChr));

    while (basePath.length > 0) {
        val = basePath.shift();
        if (val === '.') {
            // Ignore
        } else if (val === '..' && newPath.length > 0 && newPath[newPath.length - 1] !== '..') {
            newPath.pop();
        } else {
            newPath.push(val);
        }
    }

    return newPath.join(sepChr);
};

exports.findBase = function (file) {
    const paths = exports.normalize(file.split(sepChr));
    // We want everything before the file
    if (paths.length > 1) {
        // Get rid of the filename
        paths.pop();
        return paths.join(sepChr) + sepChr;
    }

    // We're in the file directory
    return '';
};

exports.removePath = function (path, file) {
    if (!path) {
        return '';
    }

    const filePath = exports.normalize(file.split(sepChr));

    return filePath.join(sepChr);
};

exports.normalize = function (fileArr) {
    const newArr = [];
    let val;
    while (fileArr.length > 0) {
        val = fileArr.shift();
        if (val !== '') {
            newArr.push(val);
        }
    }

    return newArr;
};

exports.stripSlash = function (path) {
    if (path.slice(-1) === '/') {
        path = path.slice(0, Math.max(0, path.length - 1));
    }

    return path;
};

exports.mkdir = function (dir) {
    try {
        FS.mkdirSync(dir);
    } catch (error) {
        if (error.code === 'EEXIST') {
            // ignore if it's a "EEXIST" exeption
        } else {
            console.log(error);
            throw error;
        }
    }
};
