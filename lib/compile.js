const FS = require('fs');
const minimatch = require('minimatch');
const WALK = require('walk');
const Twig = require('../twig');
const PATHS = require('./paths');

const {twig} = Twig;

exports.defaults = {
    compress: false,
    pattern: '*\\.twig',
    recursive: false
};

exports.compile = function (options, files) {
    // Create output template directory if necessary
    if (options.output) {
        PATHS.mkdir(options.output);
    }

    files.forEach(file => {
        FS.stat(file, (err, stats) => {
            if (err) {
                console.error('ERROR ' + file + ': Unable to stat file');
                return;
            }

            if (stats.isDirectory()) {
                parseTemplateFolder(file, options.pattern);
            } else if (stats.isFile()) {
                parseTemplateFile(file);
            } else {
                console.log('ERROR ' + file + ': Unknown file information');
            }
        });
    });

    function parseTemplateFolder(directory, pattern) {
        directory = PATHS.stripSlash(directory);

        // Get the files in the directory
        // Walker options
        const walker = WALK.walk(directory, {followLinks: false});
        const files = [];

        walker.on('file', (root, stat, next) => {
            // Normalize (remove / from end if present)
            root = PATHS.stripSlash(root);

            // Match against file pattern
            const {name} = stat;
            const file = root + '/' + name;
            if (minimatch(name, pattern)) {
                parseTemplateFile(file, directory);
                files.push(file);
            }

            next();
        });

        walker.on('end', () => {
            // Console.log(files);
        });
    }

    function parseTemplateFile(file, base) {
        if (base) {
            base = PATHS.stripSlash(base);
        }

        const splitFile = file.split('/');
        const outputFileName = splitFile.pop();
        const outputFileBase = PATHS.findBase(file);
        const outputDirectory = options.output;
        let outputBase = PATHS.removePath(base, outputFileBase);
        let outputId;
        let outputFile;

        if (outputDirectory) {
            // Create template directory
            if (outputBase !== '') {
                PATHS.mkdir(outputDirectory + '/' + outputBase);
                outputBase += '/';
            }

            outputId = outputDirectory + '/' + outputBase + outputFileName;
            outputFile = outputId + '.js';
        } else {
            outputId = file;
            outputFile = outputId + '.js';
        }

        twig({
            id: outputId,
            path: file,
            load(template) {
                // Compile!
                const output = template.compile(options);

                FS.writeFile(outputFile, output, 'utf8', err => {
                    if (err) {
                        console.log('Unable to compile ' + file + ', error ' + err);
                    } else {
                        console.log('Compiled ' + file + '\t-> ' + outputFile);
                    }
                });
            }
        });
    }
};
