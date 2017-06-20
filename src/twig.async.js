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
            fn(resolve, reject);
        }, reject);
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
    Twig.Promise = function(executor, /* internal -> */ initialState, initialValue) {
        // State
        var handlers = null;


        // The state has been changed to either resolve, or reject
        // which means we should call the handler.
        function resolved(onResolved) {
            onResolved(p._value);
        };
        function rejected(onResolved, onRejected) {
            onRejected(p._value);
        };

        var append = function unknown(onResolved, onRejected) {
            handlers = pending(handlers, onResolved, onRejected);
        };

        if (initialState)
            append = initialState == STATE_RESOLVED ? resolved : rejected;

        function onReject(e) { changeState(STATE_REJECTED, e); }
        function changeState(newState, v) {
            if (p._state) return;

            p._value = v;
            p._state = newState;

            append = newState == STATE_RESOLVED ? resolved : rejected;

            if (!handlers) return;

            if (handlers[2] === -2) {
                append(handlers[0], handlers[1]);
                handlers = null;
            }

            Twig.forEach(handlers, function changeStateLoop(h) {
                append(h[0], h[1]);
            });
            handlers = null;
        }

        function ready(result) {
            var isPromise = Twig.isPromise(result);
            var state = STATE_RESOLVED;

            if (isPromise && !result._state)
                return run(result.then.bind(result), ready, onReject);

            if (isPromise && result._state) {
                state = result._state;
                result = result._value;
            }

            Twig.attempt(function() {
                changeState(state, result);
            }, onReject);
        }

        var p = {
            _value: initialState ? initialValue : null,
            _state: initialState || STATE_UNKNOWN,

            then: function(onResolved, onRejected) {
                var hasResolved = typeof onResolved == 'function';
                var hasRejected = typeof onRejected == 'function';

                // Shortcut for resolved twig promises
                if (p._state == STATE_RESOLVED && !hasResolved) {
                    return Twig.Promise.resolve(p._value);
                } else if (p._state === STATE_RESOLVED) {
                    return Twig.attempt(function() {
                        return Twig.Promise.resolve(onResolved(p._value));
                    }, Twig.Promise.reject);
                }

                return Twig.Promise(function thenExecutor(resolve, reject) {
                    append(
                        hasResolved ? function thenResolve(result) {
                            Twig.attempt(function thenAttemptResolve() {
                                resolve(onResolved(result));
                            }, reject);
                        } : resolve,
                        hasRejected ? function thenReject(err) {
                            Twig.attempt(function thenAttemptReject() {
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

        if (!initialState)
            run(executor, ready, onReject);

        return p;
    }

    Twig.Promise.resolve = function(value) {
        if (Twig.isPromise(value))
            return value;

        return Twig.Promise(null, STATE_RESOLVED, value);
    };

    Twig.Promise.reject = function(e) {
        return Twig.Promise(null, STATE_REJECTED, e);
    };

    Twig.Promise.all = function TwigPromiseAll(promises) {
        var results = new Array(promises.length);

        return Twig.async.forEach(promises, function promiseAllCb(p, index) {
            if (!Twig.isPromise(p)) {
                results[index] = p;
                return;
            }

            return p.then(function promiseAllThen(v) {
                results[index] = v;
            });
        })
        .then(function promiseAllResults() {
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
        var index = 0;

        function next(value) {
            var resp = null;

            do {
                if (index == len)
                    return Twig.Promise.resolve();

                resp = callback(arr[index], index);
                index++;
            } while(!resp || !Twig.isPromise(resp) || resp._state == STATE_RESOLVED);

            return resp.then(next);
        }

        return next();
    };

    return Twig;

};
