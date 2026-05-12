const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
require('should-sinon');

const Twig = require('..');
const compileModule = require('../lib/compile');
const PATHS = require('../lib/paths');

describe('lib/compile ->', function () {
    describe('defaults ->', function () {
        it('should have compress set to false', function () {
            compileModule.defaults.compress.should.equal(false);
        });

        it('should have pattern set to *.twig', function () {
            compileModule.defaults.pattern.should.equal('*.twig');
        });

        it('should have recursive set to false', function () {
            compileModule.defaults.recursive.should.equal(false);
        });
    });

    describe('compile ->', function () {
        let mkdirStub;
        let writeFileStub;

        beforeEach(function () {
            // Disable Twig template caching so the same template IDs can
            // be registered across tests without colliding.
            Twig.cache(false);
            mkdirStub = sinon.stub(PATHS, 'mkdir');
            writeFileStub = sinon.stub(fs, 'writeFile');
        });

        afterEach(function () {
            sinon.restore();
            Twig.cache(true);
        });

        describe('output directory ->', function () {
            it('should create output directory when output option is provided', function () {
                compileModule.compile({output: 'dist/templates'}, []);
                mkdirStub.should.be.calledWith('dist/templates');
            });

            it('should not create output directory when output option is not provided', function () {
                compileModule.compile({}, []);
                mkdirStub.should.not.be.called();
            });
        });

        describe('fs.statSync handling ->', function () {
            it('should call fs.statSync for each file', function () {
                sinon.stub(console, 'log');
                const statStub = sinon.stub(fs, 'statSync').returns({
                    isDirectory() {
                        return false;
                    },
                    isFile() {
                        return false;
                    }
                });
                compileModule.compile({}, ['file1.twig', 'file2.twig', 'file3.twig']);

                statStub.should.be.calledThrice();
                statStub.firstCall.args[0].should.equal('file1.twig');
                statStub.secondCall.args[0].should.equal('file2.twig');
                statStub.thirdCall.args[0].should.equal('file3.twig');
            });

            it('should throw when fs.statSync fails', function () {
                sinon.stub(fs, 'statSync').throws(new Error('ENOENT'));

                (function () {
                    compileModule.compile({}, ['missing.twig']);
                }).should.throw('ENOENT');
            });

            it('should log error for unknown file types', function () {
                const consoleStub = sinon.stub(console, 'log');
                sinon.stub(fs, 'statSync').returns({
                    isDirectory() {
                        return false;
                    },
                    isFile() {
                        return false;
                    }
                });

                compileModule.compile({}, ['unknown_type']);

                consoleStub.should.be.calledOnce();
                consoleStub.firstCall.args[0].should.containEql('ERROR');
                consoleStub.firstCall.args[0].should.containEql('unknown_type');
                consoleStub.firstCall.args[0].should.containEql('Unknown file information');
            });
        });

        describe('single file compilation ->', function () {
            it('should compile a template file and write output with .js extension', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    outputFile.should.equal(testFile + '.js');
                    encoding.should.equal('utf8');
                    output.should.be.a.String();
                    output.should.containEql('precompiled: true');
                });

                compileModule.compile({}, [testFile]);
            });

            it('should use the file path as the template id when no output directory is specified', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    output.should.containEql('id:"' + testFile + '"');
                });

                compileModule.compile({}, [testFile]);
            });

            it('should write compiled output to the output directory when specified', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                const outputDir = path.join(__dirname, 'compiler', 'output');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    outputFile.should.equal(outputDir + '/test.twig.js');
                    output.should.be.a.String();
                    output.should.containEql('precompiled: true');
                });

                compileModule.compile({output: outputDir}, [testFile]);
            });

            it('should use the output directory in the template id when output is specified', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                const outputDir = path.join(__dirname, 'compiler', 'output');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    output.should.containEql('id:"' + outputDir + '/test.twig"');
                });

                compileModule.compile({output: outputDir}, [testFile]);
            });

            it('should log success message when compilation succeeds', function () {
                const consoleStub = sinon.stub(console, 'log');
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    consoleStub.should.be.calledOnce();
                    consoleStub.firstCall.args[0].should.containEql('Compiled');
                    consoleStub.firstCall.args[0].should.containEql(testFile);
                    consoleStub.firstCall.args[0].should.containEql(testFile + '.js');
                });

                compileModule.compile({}, [testFile]);
            });

            it('should log error when writeFile fails', function () {
                const consoleStub = sinon.stub(console, 'log');
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(new Error('disk full'));
                    consoleStub.should.be.calledOnce();
                    consoleStub.firstCall.args[0].should.containEql('Unable to compile');
                    consoleStub.firstCall.args[0].should.containEql(testFile);
                });

                compileModule.compile({}, [testFile]);
            });

            it('should pass options through to template.compile using default wrap format', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    cb(null);
                    output.should.startWith('twig({');
                    output.should.containEql('precompiled: true');
                });

                compileModule.compile({}, [testFile]);
            });
        });

        describe('directory compilation ->', function () {
            it('should walk a directory and compile all matching .twig files', function () {
                const srcDir = path.join(__dirname, 'compiler', 'src');
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(outputFile);
                    output.should.be.a.String();
                    output.should.containEql('precompiled: true');
                    cb(null);
                });

                compileModule.compile({pattern: '*.twig'}, [srcDir]);

                // src/ contains dir_test.twig and sub/sub.twig
                compiledFiles.length.should.equal(2);
                compiledFiles.sort();

                const dirTestFile = path.join(srcDir, 'dir_test.twig.js');
                const subFile = path.join(srcDir, 'sub', 'sub.twig.js');

                compiledFiles.should.containEql(dirTestFile);
                compiledFiles.should.containEql(subFile);
            });

            it('should only compile files matching the given pattern', function () {
                const srcDir = path.join(__dirname, 'compiler');
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(path.basename(outputFile));
                    cb(null);
                });

                compileModule.compile({pattern: '*.twig'}, [srcDir]);

                // Only .twig files should match, not test.html
                compiledFiles.length.should.be.aboveOrEqual(1);
                compiledFiles.forEach(file => {
                    file.should.endWith('.twig.js');
                });
                compiledFiles.should.not.containEql('test.html.js');
            });

            it('should compile directory files into output directory', function () {
                const srcDir = path.join(__dirname, 'compiler', 'src');
                const outputDir = path.join(__dirname, 'compiler', 'build_output');
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(outputFile);
                    outputFile.should.startWith(outputDir + '/');
                    outputFile.should.endWith('.twig.js');
                    cb(null);
                });

                compileModule.compile({output: outputDir, pattern: '*.twig'}, [srcDir]);

                compiledFiles.length.should.equal(2);
                // mkdir is called once for the output dir and once for each
                // subdirectory structure under it
                mkdirStub.should.be.called();
                mkdirStub.firstCall.args[0].should.equal(outputDir);
            });

            it('should strip trailing slash from directory path', function () {
                const srcDir = path.join(__dirname, 'compiler', 'src') + '/';
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(outputFile);
                    outputFile.should.not.containEql('//');
                    cb(null);
                });

                compileModule.compile({pattern: '*.twig'}, [srcDir]);

                compiledFiles.length.should.be.aboveOrEqual(1);
            });
        });

        describe('using defaults ->', function () {
            it('should use the default pattern to match only .twig files when compiling a directory', function () {
                // The compiler directory contains test.twig, test.html, and
                // subdirectories with more .twig files — the default pattern
                // *.twig should match .twig files and skip test.html.
                const srcDir = path.join(__dirname, 'compiler');
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(path.basename(outputFile));
                    cb(null);
                });

                // Pass defaults directly, as the CLI does
                compileModule.compile(compileModule.defaults, [srcDir]);

                compiledFiles.length.should.be.aboveOrEqual(1);
                compiledFiles.forEach(file => {
                    file.should.endWith('.twig.js');
                });
                compiledFiles.should.not.containEql('test.html.js');
            });
        });

        describe('mixed files and directories ->', function () {
            it('should handle a mix of file and directory inputs', function () {
                const testFile = path.join(__dirname, 'compiler', 'test.twig');
                const srcDir = path.join(__dirname, 'compiler', 'src');
                const compiledFiles = [];

                writeFileStub.callsFake((outputFile, output, encoding, cb) => {
                    compiledFiles.push(outputFile);
                    cb(null);
                });

                compileModule.compile({pattern: '*.twig'}, [testFile, srcDir]);

                // test.twig (single file) + dir_test.twig + sub/sub.twig (from directory walk)
                compiledFiles.length.should.equal(3);
            });
        });
    });
});
