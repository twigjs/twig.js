/* jshint node: true */

(function () {
    'use strict';
    const fs = require('fs');
    const path = require('path');
    const twigPhpDir = 'test-ext/twig.php';

    const runTest = function () {
        describe('Twig original test ->', function () {
            var
                Twig = Twig || require('..');
            var twig = twig || Twig.twig;
            var walk = function (dir, done) {
                let results = [];
                const list = fs.readdirSync(dir);
                let i = 0;

                (function next() {
                    let file = list[i++];
                    let stat;
                    if (!file) {
                        return done(null, results);
                    }

                    file = dir + '/' + file;
                    stat = fs.statSync(file);
                    if (stat && stat.isDirectory()) {
                        walk(file, (err, res) => {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        results.push(file);
                        next();
                    }
                })();
            };

            const testFile = function (filepath) {
                const tmp = fs.readFileSync(filepath, 'utf8');
                const tmp2 = tmp.split(/^--/gm);
                const res = {};

                tmp2.forEach(data => {
                    if (!data) {
                        return;
                    }

                    const name = (String(data.match(/^[A-Z]+--/)) || '').replace(/--$/, '');

                    if (name) {
                        res[name] = data.slice(Math.max(0, name.length + 3)).trim();
                    }
                });

                res.filepath = filepath;

                return res;
            };

            walk(twigPhpDir + '/test', (err, files) => {
                const testFiles = [];

                files.forEach(filepath => {
                    if (filepath.slice(Math.max(0, filepath.length - 5)) === '.test') {
                        testFiles.push(testFile(filepath));
                    }
                });

                testFiles.forEach((data, idx) => {
                    const Tokenizer = require('tokenizer2');
                    const t = new Tokenizer();
                    let res;
                    const str = data.DATA;
                    let currentObject;
                    if (!data.DATA || data.DATA.match(/^class|\$|^date_default_timezone_set|new Twig|new SimpleXMLElement|new ArrayObject|new ArrayIterator/)) {
                        if (data.EXCEPTION) {
                            it(data.filepath + ' -> ' + data.TEST.trim(), function () {
                                try {
                                    twig({
                                        data: data.TEMPLATE.trim()
                                    })
                                        .render(res)
                                        .trim();
                                } catch (error) {
                                    return;
                                }

                                throw 'Should have thrown an exception: ' + data.EXCEPTION;
                            });
                        } else {
                            it(data.filepath + ' -> ' + data.TEST.trim(), function () {
                                throw 'Unsupported';
                            });
                        }

                        delete testFiles[idx];
                        return;
                    }

                    t.on('token', (token, type) => {
                        // Console.log( token, type, res, currentObject );

                        let tmpObject;
                        let match;
                        let tmpLength;
                        let tmpString;
                        let parentObject;
                        let i;
                        if (type === 'symbol') {
                            if (token === 'return') {
                                return;
                            }
                        }

                        if (type === 'whitespace') {
                            return;
                        }

                        if (type === 'semicolon') {
                            return;
                        }

                        if (type === 'array') {
                            if (!currentObject) {
                                currentObject = {
                                    type: 'array',
                                    keys: [],
                                    values: []
                                };
                            } else {
                                tmpObject = currentObject;
                                currentObject = {
                                    type: 'array',
                                    keys: [],
                                    values: [],
                                    parent: tmpObject
                                };
                            }

                            return;
                        }

                        if (type === 'string') {
                            match = token.match(/^'(([^']*| \\')*)'$/);
                            if (match && match[1]) {
                                tmpString = match[1];
                            } else {
                                match = token.match(/^"(([^"]*| \\")*)"$/);
                                if (match && match[1]) {
                                    tmpString = match[1];
                                }
                            }

                            if (tmpString) {
                                currentObject.last_value = tmpString.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                                return;
                            }
                        }

                        if (type === 'number') {
                            currentObject.last_value = parseFloat(token, 10);
                            return;
                        }

                        if (type === 'comma') {
                            if (currentObject.last_value) {
                                if (currentObject.type === 'array') {
                                    tmpLength = currentObject.values.length;
                                    currentObject.keys.push(tmpLength);
                                    currentObject.values.push(currentObject.last_value);
                                    delete currentObject.last_value;

                                    return;
                                }

                                if (currentObject.type === 'object') {
                                    currentObject.keys.push(currentObject.last_key);
                                    currentObject.values.push(currentObject.last_value);
                                    delete currentObject.last_key;
                                    delete currentObject.last_value;
                                    return;
                                }
                            }
                        }

                        if (type === 'key-label') {
                            currentObject.type = 'object';
                            currentObject.last_key = currentObject.last_value;
                            delete currentObject.last_value;

                            return;
                        }

                        if (type === 'end-object') {
                            if (currentObject.type === 'array') {
                                if (currentObject.last_value) {
                                    tmpLength = currentObject.values.length;
                                    currentObject.keys.push(tmpLength);
                                    currentObject.values.push(currentObject.last_value);
                                    delete currentObject.last_value;
                                }
                            } else if (currentObject.type === 'object') {
                                if (currentObject.last_key && currentObject.last_value) {
                                    currentObject.keys.push(currentObject.last_key);
                                    currentObject.values.push(currentObject.last_value);
                                    delete currentObject.last_key;
                                    delete currentObject.last_value;
                                }
                            }

                            if (currentObject.type === 'array') {
                                tmpObject = [];
                            } else if (currentObject.type === 'object') {
                                tmpObject = {};
                            }

                            for (i = 0; i < currentObject.values.length; i += 1) {
                                tmpObject[currentObject.keys[i]] = currentObject.values[i];
                            }

                            if (currentObject.parent) {
                                parentObject = currentObject.parent;
                                delete currentObject.parent;
                                delete currentObject.last_key;
                                delete currentObject.last_value;
                                currentObject = parentObject;
                                currentObject.last_value = tmpObject;
                            } else {
                                res = tmpObject;
                                currentObject = undefined;
                            }
                        }
                    });

                    t.on('end', () => {
                        /*
						If ( data.TEST.trim( ) === 'Twig supports the in operator' ) {
							console.log( data.TEST.trim( ), res, data.DATA );
							console.log( "data.TEMPLATE" );
							console.log( data.TEMPLATE );
							console.log( data.TEMPLATE.substr( -1 ) );
							console.log( "data.EXPECT" );
							console.log( data.EXPECT );
							console.log( "data.RESULT" );
							console.log(
								twig( {
									"data" : data.TEMPLATE
								} )
								.render( res )
							);
						}
						*/

                        it(data.filepath + ' -> ' + data.TEST.trim(), function () {
                            twig({
                                data: data.TEMPLATE.trim()
                            })
                                .render(res)
                                .trim()
                                .should
                                .equal(data.EXPECT);
                        });
                    });

                    t.on('error', err => {
                        // Console.log( err );
                    });

                    t.addRule(/^'([^']|\\')*'$/, 'string');
                    t.addRule(/^"([^"]|\\")*"$/, 'string');
                    t.addRule(/^'([^']|\\')*$/, 'maybe-string');
                    t.addRule(/^"([^"]|\\")*$/, 'maybe-string');
                    t.addRule(/^=$/, 'equal');
                    t.addRule(/^=>$/, 'key-label');
                    t.addRule(/^-\?\d+(\.\d+)?$/, 'number');
                    t.addRule(/^\d+$/, 'number');
                    t.addRule(/^\d+\.$/, 'maybe-float');
                    t.addRule(/^(true|false)$/, 'bool');
                    t.addRule(/^null$/, 'null');
                    t.addRule(/^array\s*\($/, 'array');
                    t.addRule(/^\($/, 'begin-object');
                    t.addRule(/^\)$/, 'end-object');
                    t.addRule(/^\[$/, 'begin-array');
                    t.addRule(/^\]$/, 'end-array');
                    t.addRule(/^,$/, 'comma');
                    t.addRule(/^'$/, 'ping');
                    t.addRule(/^;$/, 'semicolon');
                    t.addRule(/^"$/, 'double-ping');
                    t.addRule(/^\w+$/, 'symbol');
                    t.addRule(/^(\s)+$/, 'whitespace');

                    t.write(str + ' ');
                    t.end();
                });
            });
        });
    };

    const setup = function () {
        const existsSync = fs.existsSync || path.existsSync;

        if (existsSync(twigPhpDir)) {
            runTest();
        }
    };

    setup();
})();
