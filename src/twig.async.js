// ## twig.async.js
//
// This file handles asynchronous tasks within twig.
class TwigAsync {
    Twig
    constructor(Twig) {
        this.Twig = Twig
    }

    STATE_UNKNOWN = 0;
    STATE_RESOLVED = 1;
    STATE_REJECTED = 2;

    ParseStateParseAsync(tokens, context) {
        return this.parse(tokens, context, true);
    };

    ExpressionParseAsync(tokens, context, tokensAreParameters) {
        const state = this;

        return this.expression.parse.call(state, tokens, context, tokensAreParameters, true);
    };

    LogicParseAsync (token, context, chain) {
        const state = this;

        return this.logic.parse.call(state, token, context, chain, true);
    };

    TemplatePrototypeRenderAsync (context, params) {
        return this.render(context, params, true);
    };

    /**
     * Checks for `thenable` objects
     */
    isPromise(obj) {
        return obj && obj.then && (typeof obj.then === 'function');
    };

    /**
     * Handling of code paths that might either return a promise
     * or a value depending on whether async code is used.
     *
     * @see https://github.com/twigjs/twig.js/blob/master/ASYNC.md#detecting-asynchronous-behaviour
     */
    potentiallyAsyncSlow(that, allowAsync, action) {
        let result = action.call(that);
        let err = null;
        let isAsync = true;

        if (!isPromise(result)) {
            return result;
        }

        result.then(res => {
            result = res;
            isAsync = false;
        }).catch(error => {
            err = error;
        });

        if (err !== null) {
            throw err;
        }

        if (isAsync) {
            throw new this.Twig.Error('You are using Twig.js in sync mode in combination with async extensions.');
        }

        return result;
    }

    AsyncPotentiallyAsync = function (that, allowAsync, action) {
        if (allowAsync) {
            return this.Promise.resolve(action.call(that));
        }

        return potentiallyAsyncSlow(that, allowAsync, action);
    };

    run(fn, resolve, reject) {
        try {
            fn(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    pending(handlers, onResolved, onRejected) {
        const h = [onResolved, onRejected, -2];

        // The promise has yet to be rejected or resolved.
        if (!handlers) {
            handlers = h;
        } else if (handlers[2] === -2) {
            // Only allocate an array when there are multiple handlers
            handlers = [handlers, h];
        } else {
            handlers.push(h);
        }

        return handlers;
    }

    /**
     * Really small thenable to represent promises that resolve immediately.
     *
     */

    // Клас по суті буде ?

    Twig.Thenable = function (then, value, state) {
        this.then = then;
        this._value = state ? value : null;
        this._state = state || STATE_UNKNOWN;
    };

    // Реалізація класу 

    class Thenable {
        constructor(then, value, state) {
            this.then = then;
            this._value = state ? value : null;
            this._state = state || STATE_UNKNOWN;
        }
    }

    catch(onRejected) {
        if (this._state === STATE_RESOLVED) {
            return this;
        }

        return this.then(null, onRejected);
    } 

    /**
     * The `then` method attached to a Thenable when it has resolved.
     *
     */
    resolvedThen(onResolved) {
        try {
            return this.Promise.resolve(onResolved(this._value));
        } catch (error) {
            return this.Promise.reject(error);
        }
    };

    /**
     * The `then` method attached to a Thenable when it has rejected.
     *
     */
    rejectedThen(onResolved, onRejected) {
        // Shortcut for rejected twig promises
        if (!onRejected || typeof onRejected !== 'function') {
            return this;
        }

        const value = this._value;

        let result;
        try {
            result = onRejected(value);
        } catch (error) {
            result = this.Promise.reject(error);
        }

        return this.Promise.resolve(result);
    };

    /**
     * An alternate implementation of a Promise that does not fully follow
     * the spec, but instead works fully synchronous while still being
     * thenable.
     *
     * These promises can be mixed with regular promises at which point
     * the synchronous behaviour is lost.
     */
    promise = new Promise(executor) {
        let state = STATE_UNKNOWN;
        let value = null;

        let changeState = function (nextState, nextValue) {
            state = nextState;
            value = nextValue;
        };

        function onReady(v) {
            changeState(STATE_RESOLVED, v);
        }

        function onReject(e) {
            changeState(STATE_REJECTED, e);
        }

        run(executor, onReady, onReject);

        // If the promise settles right after running the executor we can
        // return a Promise with it's state already set.
        //
        // Twig.Promise.resolve and Twig.Promise.reject both use the more
        // efficient `Twig.Thenable` for this purpose.
        if (state === STATE_RESOLVED) {
            return this.Promise.resolve(value);
        }

        if (state === STATE_REJECTED) {
            return this.Promise.reject(value);
        }
        // If we managed to get here our promise is going to resolve asynchronous.

        changeState = new this.FullPromise();

        return changeState.promise;
    };

    /**
     * Promise implementation that can handle being resolved at any later time.
     *
     */
    FullPromise() {
        let handlers = null;

        // The state has been changed to either resolve, or reject
        // which means we should call the handler.
        function resolved(onResolved) {
            onResolved(p._value);
        }

        function rejected(onResolved, onRejected) {
            onRejected(p._value);
        }

        let append = function (onResolved, onRejected) {
            handlers = pending(handlers, onResolved, onRejected);
        };

        function changeState(newState, v) {
            if (p._state) {
                return;
            }

            p._value = v;
            p._state = newState;

            append = newState === STATE_RESOLVED ? resolved : rejected;

            if (!handlers) {
                return;
            }

            if (handlers[2] === -2) {
                append(handlers[0], handlers[1]);
                handlers = null;
                return;
            }

            handlers.forEach(h => {
                append(h[0], h[1]);
            });
            handlers = null;
        }

        const p = new this.Thenable((onResolved, onRejected) => {
            const hasResolved = typeof onResolved === 'function';

            // Shortcut for resolved twig promises
            if (p._state === STATE_RESOLVED && !hasResolved) {
                return this.Promise.resolve(p._value);
            }

            if (p._state === STATE_RESOLVED) {
                try {
                    return this.Promise.resolve(onResolved(p._value));
                } catch (error) {
                    return this.Promise.reject(error);
                }
            }

            const hasRejected = typeof onRejected === 'function';

            return new this.Promise((resolve, reject) => {
                append(
                    hasResolved ? result => {
                        try {
                            resolve(onResolved(result));
                        } catch (error) {
                            reject(error);
                        }
                    } : resolve,
                    hasRejected ? err => {
                        try {
                            resolve(onRejected(err));
                        } catch (error) {
                            reject(error);
                        }
                    } : reject
                );
            });
        });

        changeState.promise = p;

        return changeState;
    };

    this.Promise.defaultResolved = new this.Thenable(this.Thenable.resolvedThen, undefined, STATE_RESOLVED);
    this.Promise.emptyStringResolved = new this.Thenable(this.Thenable.resolvedThen, '', STATE_RESOLVED);

    this.Promise.resolve = function (value) {
        if (arguments.length === 0 || typeof value === 'undefined') {
            return this.Promise.defaultResolved;
        }

        if (isPromise(value)) {
            return value;
        }

        // Twig often resolves with an empty string, we optimize for this
        // scenario by returning a fixed promise. This reduces the load on
        // garbage collection.
        if (value === '') {
            return this.Promise.emptyStringResolved;
        }

        return new this.Thenable(Twig.Thenable.resolvedThen, value, STATE_RESOLVED);
    };

    this.Promise.reject = function (e) {
        // `e` should never be a promise.
        return new this.Thenable(this.Thenable.rejectedThen, e, STATE_REJECTED);
    };

    this.Promise.all = function (promises) {
        const results = new Array(promises.length);

        return this.async.forEach(promises, (p, index) => {
            if (!isPromise(p)) {
                results[index] = p;
                return;
            }

            if (p._state === STATE_RESOLVED) {
                results[index] = p._value;
                return;
            }

            return p.then(v => {
                results[index] = v;
            });
        }).then(() => {
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
    this.async.forEach = function (arr, callback) {
        const len = arr ? arr.length : 0;
        let index = 0;

        function next() {
            let resp = null;

            do {
                if (index === len) {
                    return this.Promise.resolve();
                }

                resp = callback(arr[index], index);
                index++;

            // While the result of the callback is not a promise or it is
            // a promise that has settled we can use a regular loop which
            // is much faster.
            } while (!resp || !isPromise(resp) || resp._state === STATE_RESOLVED);

            return resp.then(next);
        }

        return next();
    };
};

export default function (Twig) {
    Twig.async = new TwigAsync(Twig)
}