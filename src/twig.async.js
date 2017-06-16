// ## twig.async.js
//
// This file handles asynchronous tasks within twig.
module.exports = function (Twig) {
    "use strict";

    var STATE_UNKNOWN = 0;
    var STATE_RESOLVED = 1;
    var STATE_REJECTED = 2;

    Twig.parseAsync = function (tokens, context) {
        return Twig.parse.call(this, tokens, context, true);
    }

    Twig.expression.parseAsync = function (tokens, context, tokens_are_parameters) {
        return Twig.expression.parse.call(this, tokens, context, tokens_are_parameters, true);
    }

    Twig.logic.parseAsync = function (token, context, chain) {
        return Twig.logic.parse.call(this, token, context, chain, true);
    }

    Twig.Template.prototype.renderAsync = function (context, params) {
        return this.render(context, params, true);
    }

    Twig.async = {};

    /**
     * Checks for `thenable` objects
     */
    Twig.isPromise = function(obj) {
        return obj && obj.then && (typeof obj.then == 'function');
    }

    function run(fn, resolve, reject) {
        Twig.attempt(function() {
            fn(function(v) {
                resolve(v);
                resolve = reject = Twig.noop;
            }, function(e) {
                reject(e);
                resolve = reject = Twig.noop;
            });
        }, function(e) {
            reject(e);
            resolve = reject = Twig.noop;
        });
    }

    function pending(handlers, onResolved, onRejected) {
        var h = [ onResolved, onRejected, -2 ];

        // The promise has yet to be rejected or resolved.
        if (!handlers)
            handlers = h;
        // Only allocate an array when there are multiple handlers
        else if (handlers[2] == -2)
            handlers = [ handlers, h ];
        else
            handlers.push(h);

        return handlers;
    }

    /**
     * An alternate implementation of a Promise that does not fully follow
     * the spec, but instead works fully synchronous while still being
     * thenable.
     *
     * These promises can be mixed with regular promises at which point
     * the synchronous behaviour is lost.
     */
    Twig.Promise = function(executor) {
        // State
        var state = STATE_UNKNOWN;
        var value = null;
        var handlers = null;

        var append = function append(onResolved, onRejected) {
            handlers = pending(handlers, onResolved, onRejected);
        };

        // The state has been changed to either resolve, or reject
        // which means we should call the handler.
        var resolved = function appendResolved(onResolved) {
            onResolved(value);
        };
        var rejected = function appendRejected(onResolved, onRejected) {
            onRejected(value);
        };

        function onReject(e) { changeState(STATE_REJECTED, e); }
        function changeState(newState, v) {
            state = newState;
            value = v;

            append = newState == STATE_RESOLVED ? resolved : rejected;

            if (!handlers) return;

            if (handlers[2] === -2)
                return append(handlers[0], handlers[1]);

            Twig.forEach(handlers, function(h) {
                append(h[0], h[1]);
            });
            handlers = null;
        }

        function ready(result) {
            if (Twig.isPromise(result))
                return run(result.then.bind(result), ready, onReject);

            Twig.attempt(function() {
                changeState(STATE_RESOLVED, result);
            }, onReject);
        }

        run(executor, ready, onReject);

        return {
            then: function(onResolved, onRejected) {
                var hasResolved = typeof onResolved == 'function';
                var hasRejected = typeof onRejected == 'function';

                return Twig.Promise(function(resolve, reject) {
                    append(
                        hasResolved ? function(result) {
                            Twig.attempt(function() {
                                resolve(onResolved(result));
                            }, reject);
                        } : resolve,
                        hasRejected ? function(err) {
                            Twig.attempt(function() {
                                resolve(onRejected(err));
                            }, reject);
                        } : reject
                    );
                });
            },
            catch: function(onRejected) {
                return this.then(null, onRejected);
            }
        };
    }

    Twig.Promise.resolve = function(value) {
        if (Twig.isPromise(value))
            return value;

        return Twig.Promise(function(resolve) {
            resolve(value);
        });
    };

    Twig.Promise.reject = function(e) {
        return Twig.Promise(function(resolve, reject) {
            reject(e);
        });
    };

    Twig.Promise.all = function(promises) {
        var results = new Array(promises.length);

        return Twig.async.forEach(promises, function(p, index) {
            if (!Twig.isPromise(p)) {
                results[index] = p;
                return;
            }

            return p.then(function(v) {
                results[index] = v;
            });
        })
        .then(function() {
            return results;
        });
    };

    /**
    * Go over each item in a fashion compatible with Twig.forEach,
    * allow the function to return a promise or call the third argument
    * to signal it is finished.
    *
    * Each item in the array will be called sequentially.
    */
    Twig.async.forEach = function forEachAsync(arr, callback) {
        var len = arr.length;
        var arg_index = 0;

        var resolve = null;
        var reject = null;

        var promise = Twig.Promise(function(res, rej) {
            resolve = res;
            reject = rej;
        });

        function next(value) {
            if (Twig.isPromise(value)) {
                value.then(next, reject);
                return;
            }

            var index = arg_index++;

            if (index == len) {
                resolve();
                return;
            }

            next(callback(arr[index], index));
        }

        next();

        return promise;
    };

    return Twig;

};
