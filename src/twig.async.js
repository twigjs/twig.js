// ## twig.async.js
//
// This file handles asynchronous tasks within twig.
module.exports = function (Twig) {
    "use strict";

    Twig.async = {};

    Twig.isPromise = function(obj) {
        return obj && (typeof obj.then == 'function');
    }

    /**
     * An alternate implementation of a Promise that does not follow
     * the spec, but instead works fully synchronous while still being
     * thenable.
     *
     * The promises can be mixed with regular promises at which point
     * the synchronous behaviour is lost.
     */
    Twig.Promise = function(executor) {
        // State
        var state = 'unknown';
        var value = null;
        var handlers = null;

        function changeState(newState, v) {
            state = newState;
            value = v;
            notify();
        };
        function onResolve(v) { changeState('resolve', v); }
        function onReject(e) { changeState('reject', e); }

        function notify() {
            if (!handlers) return;

            Twig.forEach(handlers, function(h) {
                append(h.resolve, h.reject);
            });
            handlers = null;
        }

        function append(onResolved, onRejected) {
            var h = {
                resolve: onResolved,
                reject: onRejected
            };

            // The promise has yet to be rejected or resolved.
            if (state == 'unknown') {
                handlers = handlers || [];
                return handlers.push(h);
            }

            // The state has been changed to either resolve, or reject
            // which means we should call the handler.
            if (h[state])
                h[state](value);
        }

        function run(fn, resolve, reject) {
            var done = false;
            try {
                fn(function(v) {
                    if (done) return;
                    done = true;
                    resolve(v);
                }, function(e) {
                    if (done) return;
                    done = true;
                    reject(e);
                });
            } catch(e) {
                done = true;
                reject(e);
            }
        }

        function ready(result) {
            try {
                if (!Twig.isPromise(result)) {
                    return onResolve(result);
                }

                run(result.then.bind(result), ready, onReject);
            } catch (e) {
                onReject(e);
            }
        }

        run(executor, ready, onReject);

        return {
            then: function(onResolved, onRejected) {
                var hasResolved = typeof onResolved == 'function';
                var hasRejected = typeof onRejected == 'function';

                return new Twig.Promise(function(resolve, reject) {
                    append(function(result) {
                        if (hasResolved) {
                            try {
                                resolve(onResolved(result));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            resolve(result);
                        }
                    }, function(err) {
                        if (hasRejected) {
                            try {
                                resolve(onRejected(err));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(err);
                        }
                    });
                });
            },
            catch: function(onRejected) {
                return this.then(null, onRejected);
            }
        };
    }

    Twig.Promise.resolve = function(value) {
        return new Twig.Promise(function(resolve) {
            resolve(value);
        });
    }

    Twig.Promise.reject = function(e) {
        return new Twig.Promise(function(resolve, reject) {
            reject(e);
        });
    }

    /**
    * Go over each item in a fashion compatible with Twig.forEach,
    * allow the function to return a promise or call the third argument
    * to signal it is finished.
    *
    * Each item in the array will be called sequentially.
    */
    Twig.async.forEach = function each(arr, callback) {
        var arg_index = 0;
        var is_async = true;
        var callbacks = {};
        var promise = new Twig.Promise(function(resolve, reject) {
            callbacks = {
                resolve: resolve,
                reject: reject
            };
        });

        function fail(err) {
            callbacks.reject(err);
        }

        function next(value) {
            if (!Twig.isPromise(value))
                return iterate();

            value.then(next, fail);
        }

        function iterate() {
            var index = arg_index++;

            if (index == arr.length) {
                callbacks.resolve();
                return;
            }

            next(callback(arr[index], index));
        }

        iterate();

        return promise;
    };

};
