window.JSON || (window.JSON = {}), (function () {
    function f(a) {
        return a < 10 ? '0' + a : a;
    }

    function quote(a) {
        return escapable.lastIndex = 0, escapable.test(a) ? '"' + a.replace(escapable, a => {
            const b = meta[a]; return typeof b === 'string' ? b : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + a + '"';
    }

    function str(a, b) {
        let c; let d; let e; let f; const g = gap; let h; let i = b[a]; i && typeof i === 'object' && typeof i.toJSON === 'function' && (i = i.toJSON(a)), typeof rep === 'function' && (i = rep.call(b, a, i)); switch (typeof i) {
            case 'string': return quote(i); case 'number': return isFinite(i) ? String(i) : 'null'; case 'boolean': case 'null': return String(i); case 'object': if (!i) {
                return 'null';
            }

                gap += indent, h = []; if (Object.prototype.toString.apply(i) === '[object Array]') {
                    f = i.length; for (c = 0; c < f; c += 1) {
                        h[c] = str(c, i) || 'null';
                    }

                    return e = h.length === 0 ? '[]' : (gap ? '[\n' + gap + h.join(',\n' + gap) + '\n' + g + ']' : '[' + h.join(',') + ']'), gap = g, e;
                }

                if (rep && typeof rep === 'object') {
                    f = rep.length; for (c = 0; c < f; c += 1) {
                        d = rep[c], typeof d === 'string' && (e = str(d, i), e && h.push(quote(d) + (gap ? ': ' : ':') + e));
                    }
                } else {
                    for (d in i) {
                        Object.hasOwnProperty.call(i, d) && (e = str(d, i), e && h.push(quote(d) + (gap ? ': ' : ':') + e));
                    }
                }

                return e = h.length === 0 ? '{}' : (gap ? '{\n' + gap + h.join(',\n' + gap) + '\n' + g + '}' : '{' + h.join(',') + '}'), gap = g, e;
        }
    }

    'use strict', typeof Date.prototype.toJSON !== 'function' && (Date.prototype.toJSON = function (a) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (a) {
        return this.valueOf();
    }); const {JSON} = window; const cx = /[\u0000\u00AD\u0600-\u0604\u070F\u17B4\u17B5\u200C-\u200F\u2028-\u202F\u2060-\u206f\ufeff\ufff0-\uffff]/g; var escapable = /[\\\"\u0000-\u001F\u007F-\u009F\u00AD\u0600-\u0604\u070F\u17B4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; let gap; let indent; var meta = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\'}; let
        rep; typeof JSON.stringify !== 'function' && (JSON.stringify = function (a, b, c) {
        let d; gap = '', indent = ''; if (typeof c === 'number') {
            for (d = 0; d < c; d += 1) {
                indent += ' ';
            }
        } else {
            typeof c === 'string' && (indent = c);
        }

        rep = b; if (!b || typeof b === 'function' || typeof b === 'object' && typeof b.length === 'number') {
            return str('', {'': a});
        }

        throw new Error('JSON.stringify');
    }), typeof JSON.parse !== 'function' && (JSON.parse = function (text, reviver) {
        function walk(a, b) {
            let c; let d; const e = a[b]; if (e && typeof e === 'object') {
                for (c in e) {
                    Object.hasOwnProperty.call(e, c) && (d = walk(e, c), d !== undefined ? e[c] = d : delete e[c]);
                }
            }

            return reviver.call(a, b, e);
        }

        let j; text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, a => {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        })); if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return j = eval('(' + text + ')'), typeof reviver === 'function' ? walk({'': j}, '') : j;
        }

        throw new SyntaxError('JSON.parse');
    });
})(), (function (a, b) {
    'use strict'; const c = a.History = a.History || {}; const d = a.jQuery; if (typeof c.Adapter !== 'undefined') {
        throw new TypeError('History.js Adapter has already been loaded...');
    }

    c.Adapter = {bind(a, b, c) {
        d(a).bind(b, c);
    }, trigger(a, b, c) {
        d(a).trigger(b, c);
    }, extractEventData(a, c, d) {
        const e = c && c.originalEvent && c.originalEvent[a] || d && d[a] || b; return e;
    }, onDomLoad(a) {
        d(a);
    }}, typeof c.init !== 'undefined' && c.init();
})(window), (function (a, b) {
    'use strict'; const c = a.document; var d = a.setTimeout || d; var e = a.clearTimeout || e; var f = a.setInterval || f; const g = a.History = a.History || {}; if (typeof g.initHtml4 !== 'undefined') {
        throw new TypeError('History.js HTML4 Support has already been loaded...');
    }

    g.initHtml4 = function () {
        if (typeof g.initHtml4.initialized !== 'undefined') {
            return !1;
        }

        g.initHtml4.initialized = !0, g.enabled = !0, g.savedHashes = [], g.isLastHash = function (a) {
            const b = g.getHashByIndex(); let c; return c = a === b, c;
        }, g.saveHash = function (a) {
            return g.isLastHash(a) ? !1 : (g.savedHashes.push(a), !0);
        }, g.getHashByIndex = function (a) {
            let b = null; return typeof a === 'undefined' ? b = g.savedHashes[g.savedHashes.length - 1] : (a < 0 ? b = g.savedHashes[g.savedHashes.length + a] : b = g.savedHashes[a]), b;
        }, g.discardedHashes = {}, g.discardedStates = {}, g.discardState = function (a, b, c) {
            const d = g.getHashByState(a); let e; return e = {discardedState: a, backState: c, forwardState: b}, g.discardedStates[d] = e, !0;
        }, g.discardHash = function (a, b, c) {
            const d = {discardedHash: a, backState: c, forwardState: b}; return g.discardedHashes[a] = d, !0;
        }, g.discardedState = function (a) {
            const b = g.getHashByState(a); let c; return c = g.discardedStates[b] || !1, c;
        }, g.discardedHash = function (a) {
            const b = g.discardedHashes[a] || !1; return b;
        }, g.recycleState = function (a) {
            const b = g.getHashByState(a); return g.discardedState(a) && delete g.discardedStates[b], !0;
        }, g.emulated.hashChange && (g.hashChangeInit = function () {
            g.checkerFunction = null; let b = ''; let d; let e; let h; let i; return g.isInternetExplorer() ? (d = 'historyjs-iframe', e = c.createElement('iframe'), e.setAttribute('id', d), e.style.display = 'none', c.body.appendChild(e), e.contentWindow.document.open(), e.contentWindow.document.close(), h = '', i = !1, g.checkerFunction = function () {
                if (i) {
                    return !1;
                }

                i = !0; const c = g.getHash() || ''; let d = g.unescapeHash(e.contentWindow.document.location.hash) || ''; return c !== b ? (b = c, d !== c && (h = d = c, e.contentWindow.document.open(), e.contentWindow.document.close(), e.contentWindow.document.location.hash = g.escapeHash(c)), g.Adapter.trigger(a, 'hashchange')) : d !== h && (h = d, g.setHash(d, !1)), i = !1, !0;
            }) : g.checkerFunction = function () {
                const c = g.getHash(); return c !== b && (b = c, g.Adapter.trigger(a, 'hashchange')), !0;
            }, g.intervalList.push(f(g.checkerFunction, g.options.hashChangeInterval)), !0;
        }, g.Adapter.onDomLoad(g.hashChangeInit)), g.emulated.pushState && (g.onHashChange = function (b) {
            const d = b && b.newURL || c.location.href; const e = g.getHashByUrl(d); let f = null; let h = null; const i = null; let j; return g.isLastHash(e) ? (g.busy(!1), !1) : (g.doubleCheckComplete(), g.saveHash(e), e && g.isTraditionalAnchor(e) ? (g.Adapter.trigger(a, 'anchorchange'), g.busy(!1), !1) : (f = g.extractState(g.getFullUrl(e || c.location.href, !1), !0), g.isLastSavedState(f) ? (g.busy(!1), !1) : (h = g.getHashByState(f), j = g.discardedState(f), j ? (g.getHashByIndex(-2) === g.getHashByState(j.forwardState) ? g.back(!1) : g.forward(!1), !1) : (g.pushState(f.data, f.title, f.url, !1), !0))));
        }, g.Adapter.bind(a, 'hashchange', g.onHashChange), g.pushState = function (b, d, e, f) {
            if (g.getHashByUrl(e)) {
                throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
            }

            if (f !== !1 && g.busy()) {
                return g.pushQueue({scope: g, callback: g.pushState, args: arguments, queue: f}), !1;
            }

            g.busy(!0); const h = g.createStateObject(b, d, e); const i = g.getHashByState(h); const j = g.getState(!1); const k = g.getHashByState(j); const l = g.getHash(); return g.storeState(h), g.expectedStateId = h.id, g.recycleState(h), g.setTitle(h), i === k ? (g.busy(!1), !1) : (i !== l && i !== g.getShortUrl(c.location.href) ? (g.setHash(i, !1), !1) : (g.saveState(h), g.Adapter.trigger(a, 'statechange'), g.busy(!1), !0));
        }, g.replaceState = function (a, b, c, d) {
            if (g.getHashByUrl(c)) {
                throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
            }

            if (d !== !1 && g.busy()) {
                return g.pushQueue({scope: g, callback: g.replaceState, args: arguments, queue: d}), !1;
            }

            g.busy(!0); const e = g.createStateObject(a, b, c); const f = g.getState(!1); const h = g.getStateByIndex(-2); return g.discardState(f, e, h), g.pushState(e.data, e.title, e.url, !1), !0;
        }), g.emulated.pushState && g.getHash() && !g.emulated.hashChange && g.Adapter.onDomLoad(() => {
            g.Adapter.trigger(a, 'hashchange');
        });
    }, typeof g.init !== 'undefined' && g.init();
})(window), (function (a, b) {
    'use strict'; const c = a.console || b; const d = a.document; const e = a.navigator; const f = a.sessionStorage || !1; const g = a.setTimeout; const h = a.clearTimeout; const i = a.setInterval; const j = a.clearInterval; const k = a.JSON; const l = a.alert; const m = a.History = a.History || {}; const n = a.history; k.stringify = k.stringify || k.encode, k.parse = k.parse || k.decode; if (typeof m.init !== 'undefined') {
        throw new TypeError('History.js Core has already been loaded...');
    }

    m.init = function () {
        return typeof m.Adapter === 'undefined' ? !1 : (typeof m.initCore !== 'undefined' && m.initCore(), typeof m.initHtml4 !== 'undefined' && m.initHtml4(), !0);
    }, m.initCore = function () {
        if (typeof m.initCore.initialized !== 'undefined') {
            return !1;
        }

        m.initCore.initialized = !0, m.options = m.options || {}, m.options.hashChangeInterval = m.options.hashChangeInterval || 100, m.options.safariPollInterval = m.options.safariPollInterval || 500, m.options.doubleCheckInterval = m.options.doubleCheckInterval || 500, m.options.storeInterval = m.options.storeInterval || 1e3, m.options.busyDelay = m.options.busyDelay || 250, m.options.debug = m.options.debug || !1, m.options.initialTitle = m.options.initialTitle || d.title, m.intervalList = [], m.clearAllIntervals = function () {
            let a; const b = m.intervalList; if (typeof b !== 'undefined' && b !== null) {
                for (a = 0; a < b.length; a++) {
                    j(b[a]);
                }

                m.intervalList = null;
            }
        }, m.debug = function () {
            (m.options.debug || !1) && m.log.apply(m, arguments);
        }, m.log = function () {
            const a = typeof c !== 'undefined' && typeof c.log !== 'undefined' && typeof c.log.apply !== 'undefined'; const b = d.querySelector('#log'); let e; let f; let g; let h; let i; a ? (h = Array.prototype.slice.call(arguments), e = h.shift(), typeof c.debug !== 'undefined' ? c.debug.apply(c, [e, h]) : c.log.apply(c, [e, h])) : e = '\n' + arguments[0] + '\n'; for (f = 1, g = arguments.length; f < g; ++f) {
                i = arguments[f]; if (typeof i === 'object' && typeof k !== 'undefined') {
                    try {
                        i = k.stringify(i);
                    } catch (error) {}
                }

                e += '\n' + i + '\n';
            }

            return b ? (b.value += e + '\n-----\n', b.scrollTop = b.scrollHeight - b.clientHeight) : a || l(e), !0;
        }, m.getInternetExplorerMajorVersion = function () {
            const a = m.getInternetExplorerMajorVersion.cached = typeof m.getInternetExplorerMajorVersion.cached !== 'undefined' ? m.getInternetExplorerMajorVersion.cached : (function () {
                let a = 3; const b = d.createElement('div'); const c = b.querySelectorAll('i'); while ((b.innerHTML = '<!--[if gt IE ' + ++a + ']><i></i><![endif]-->') && c[0]) {

                }

                return a > 4 ? a : !1;
            })(); return a;
        }, m.isInternetExplorer = function () {
            const a = m.isInternetExplorer.cached = typeof m.isInternetExplorer.cached !== 'undefined' ? m.isInternetExplorer.cached : Boolean(m.getInternetExplorerMajorVersion()); return a;
        }, m.emulated = {pushState: !(a.history && a.history.pushState && a.history.replaceState && !/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(e.userAgent) && !/AppleWebKit\/5([0-2]|3[0-2])/i.test(e.userAgent)), hashChange: Boolean(!('onhashchange' in a || 'onhashchange' in d) || m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8)}, m.enabled = !m.emulated.pushState, m.bugs = {setHash: Boolean(!m.emulated.pushState && e.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)), safariPoll: Boolean(!m.emulated.pushState && e.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)), ieDoubleCheck: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8), hashEscape: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 7)}, m.isEmptyObject = function (a) {
            for (const b in a) {
                return !1;
            }

            return !0;
        }, m.cloneObject = function (a) {
            let b; let c; return a ? (b = k.stringify(a), c = k.parse(b)) : c = {}, c;
        }, m.getRootUrl = function () {
            let a = d.location.protocol + '//' + (d.location.hostname || d.location.host); if (d.location.port || !1) {
                a += ':' + d.location.port;
            }

            return a += '/', a;
        }, m.getBaseHref = function () {
            const a = d.querySelectorAll('base'); let b = null; let c = ''; return a.length === 1 && (b = a[0], c = b.href.replace(/[^\/]+$/, '')), c = c.replace(/\/+$/, ''), c && (c += '/'), c;
        }, m.getBaseUrl = function () {
            const a = m.getBaseHref() || m.getBasePageUrl() || m.getRootUrl(); return a;
        }, m.getPageUrl = function () {
            const a = m.getState(!1, !1); const b = (a || {}).url || d.location.href; let c; return c = b.replace(/\/+$/, '').replace(/[^\/]+$/, (a, b, c) => {
                return /\./.test(a) ? a : a + '/';
            }), c;
        }, m.getBasePageUrl = function () {
            const a = d.location.href.replace(/[#\?].*/, '').replace(/[^\/]+$/, (a, b, c) => {
                return /[^\/]$/.test(a) ? '' : a;
            }).replace(/\/+$/, '') + '/'; return a;
        }, m.getFullUrl = function (a, b) {
            let c = a; const d = a.slice(0, 1); return b = typeof b === 'undefined' ? !0 : b, /[a-z]+\:\/\//.test(a) || (d === '/' ? c = m.getRootUrl() + a.replace(/^\/+/, '') : d === '#' ? c = m.getPageUrl().replace(/#.*/, '') + a : d === '?' ? c = m.getPageUrl().replace(/[\?#].*/, '') + a : (b ? c = m.getBaseUrl() + a.replace(/^(\.\/)+/, '') : c = m.getBasePageUrl() + a.replace(/^(\.\/)+/, ''))), c.replace(/\#$/, '');
        }, m.getShortUrl = function (a) {
            let b = a; const c = m.getBaseUrl(); const d = m.getRootUrl(); return m.emulated.pushState && (b = b.replace(c, '')), b = b.replace(d, '/'), m.isTraditionalAnchor(b) && (b = './' + b), b = b.replace(/^(\.\/)+/g, './').replace(/\#$/, ''), b;
        }, m.store = {}, m.idToState = m.idToState || {}, m.stateToId = m.stateToId || {}, m.urlToId = m.urlToId || {}, m.storedStates = m.storedStates || [], m.savedStates = m.savedStates || [], m.normalizeStore = function () {
            m.store.idToState = m.store.idToState || {}, m.store.urlToId = m.store.urlToId || {}, m.store.stateToId = m.store.stateToId || {};
        }, m.getState = function (a, b) {
            typeof a === 'undefined' && (a = !0), typeof b === 'undefined' && (b = !0); let c = m.getLastSavedState(); return !c && b && (c = m.createStateObject()), a && (c = m.cloneObject(c), c.url = c.cleanUrl || c.url), c;
        }, m.getIdByState = function (a) {
            let b = m.extractId(a.url); let c; if (!b) {
                c = m.getStateString(a); if (typeof m.stateToId[c] !== 'undefined') {
                    b = m.stateToId[c];
                } else if (typeof m.store.stateToId[c] !== 'undefined') {
                    b = m.store.stateToId[c];
                } else {
                    for (;;) {
                        b = (new Date()).getTime() + String(Math.random()).replace(/\D/g, ''); if (typeof m.idToState[b] === 'undefined' && typeof m.store.idToState[b] === 'undefined') {
                            break;
                        }
                    }

                    m.stateToId[c] = b, m.idToState[b] = a;
                }
            }

            return b;
        }, m.normalizeState = function (a) {
            let b; let c; if (!a || typeof a !== 'object') {
                a = {};
            }

            if (typeof a.normalized !== 'undefined') {
                return a;
            }

            if (!a.data || typeof a.data !== 'object') {
                a.data = {};
            }

            b = {}, b.normalized = !0, b.title = a.title || '', b.url = m.getFullUrl(m.unescapeString(a.url || d.location.href)), b.hash = m.getShortUrl(b.url), b.data = m.cloneObject(a.data), b.id = m.getIdByState(b), b.cleanUrl = b.url.replace(/\??\&_suid.*/, ''), b.url = b.cleanUrl, c = !m.isEmptyObject(b.data); if (b.title || c) {
                b.hash = m.getShortUrl(b.url).replace(/\??\&_suid.*/, ''), /\?/.test(b.hash) || (b.hash += '?'), b.hash += '&_suid=' + b.id;
            }

            return b.hashedUrl = m.getFullUrl(b.hash), (m.emulated.pushState || m.bugs.safariPoll) && m.hasUrlDuplicate(b) && (b.url = b.hashedUrl), b;
        }, m.createStateObject = function (a, b, c) {
            let d = {data: a, title: b, url: c}; return d = m.normalizeState(d), d;
        }, m.getStateById = function (a) {
            a = String(a); const c = m.idToState[a] || m.store.idToState[a] || b; return c;
        }, m.getStateString = function (a) {
            let b; let c; let d; return b = m.normalizeState(a), c = {data: b.data, title: a.title, url: a.url}, d = k.stringify(c), d;
        }, m.getStateId = function (a) {
            let b; let c; return b = m.normalizeState(a), c = b.id, c;
        }, m.getHashByState = function (a) {
            let b; let c; return b = m.normalizeState(a), c = b.hash, c;
        }, m.extractId = function (a) {
            let b; let c; let d; return c = /(.*)\&_suid=([0-9]+)$/.exec(a), d = c ? c[1] || a : a, b = c ? String(c[2] || '') : '', b || !1;
        }, m.isTraditionalAnchor = function (a) {
            const b = !/[\/\?\.]/.test(a); return b;
        }, m.extractState = function (a, b) {
            let c = null; let d; let e; return b = b || !1, d = m.extractId(a), d && (c = m.getStateById(d)), c || (e = m.getFullUrl(a), d = m.getIdByUrl(e) || !1, d && (c = m.getStateById(d)), !c && b && !m.isTraditionalAnchor(a) && (c = m.createStateObject(null, null, e))), c;
        }, m.getIdByUrl = function (a) {
            const c = m.urlToId[a] || m.store.urlToId[a] || b; return c;
        }, m.getLastSavedState = function () {
            return m.savedStates[m.savedStates.length - 1] || b;
        }, m.getLastStoredState = function () {
            return m.storedStates[m.storedStates.length - 1] || b;
        }, m.hasUrlDuplicate = function (a) {
            let b = !1; let c; return c = m.extractState(a.url), b = c && c.id !== a.id, b;
        }, m.storeState = function (a) {
            return m.urlToId[a.url] = a.id, m.storedStates.push(m.cloneObject(a)), a;
        }, m.isLastSavedState = function (a) {
            let b = !1; let c; let d; let e; return m.savedStates.length && (c = a.id, d = m.getLastSavedState(), e = d.id, b = c === e), b;
        }, m.saveState = function (a) {
            return m.isLastSavedState(a) ? !1 : (m.savedStates.push(m.cloneObject(a)), !0);
        }, m.getStateByIndex = function (a) {
            let b = null; return typeof a === 'undefined' ? b = m.savedStates[m.savedStates.length - 1] : (a < 0 ? b = m.savedStates[m.savedStates.length + a] : b = m.savedStates[a]), b;
        }, m.getHash = function () {
            const a = m.unescapeHash(d.location.hash); return a;
        }, m.unescapeString = function (b) {
            let c = b; let d; for (;;) {
                d = a.unescape(c); if (d === c) {
                    break;
                }

                c = d;
            }

            return c;
        }, m.unescapeHash = function (a) {
            let b = m.normalizeHash(a); return b = m.unescapeString(b), b;
        }, m.normalizeHash = function (a) {
            const b = a.replace(/[^#]*#/, '').replace(/#.*/, ''); return b;
        }, m.setHash = function (a, b) {
            let c; let e; let f; return b !== !1 && m.busy() ? (m.pushQueue({scope: m, callback: m.setHash, args: arguments, queue: b}), !1) : (c = m.escapeHash(a), m.busy(!0), e = m.extractState(a, !0), e && !m.emulated.pushState ? m.pushState(e.data, e.title, e.url, !1) : d.location.hash !== c && (m.bugs.setHash ? (f = m.getPageUrl(), m.pushState(null, null, f + '#' + c, !1)) : d.location.hash = c), m);
        }, m.escapeHash = function (b) {
            let c = m.normalizeHash(b); return c = a.escape(c), m.bugs.hashEscape || (c = c.replace(/\%21/g, '!').replace(/\%26/g, '&').replace(/\%3D/g, '=').replace(/\%3F/g, '?')), c;
        }, m.getHashByUrl = function (a) {
            let b = String(a).replace(/([^#]*)#?([^#]*)#?(.*)/, '$2'); return b = m.unescapeHash(b), b;
        }, m.setTitle = function (a) {
            let b = a.title; let c; b || (c = m.getStateByIndex(0), c && c.url === a.url && (b = c.title || m.options.initialTitle)); try {
                d.querySelectorAll('title')[0].innerHTML = b.replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; ');
            } catch (error) {}

            return d.title = b, m;
        }, m.queues = [], m.busy = function (a) {
            typeof a !== 'undefined' ? m.busy.flag = a : typeof m.busy.flag === 'undefined' && (m.busy.flag = !1); if (!m.busy.flag) {
                h(m.busy.timeout); var b = function () {
                    let a; let c; let d; if (m.busy.flag) {
                        return;
                    }

                    for (a = m.queues.length - 1; a >= 0; --a) {
                        c = m.queues[a]; if (c.length === 0) {
                            continue;
                        }

                        d = c.shift(), m.fireQueueItem(d), m.busy.timeout = g(b, m.options.busyDelay);
                    }
                };

                m.busy.timeout = g(b, m.options.busyDelay);
            }

            return m.busy.flag;
        }, m.busy.flag = !1, m.fireQueueItem = function (a) {
            return a.callback.apply(a.scope || m, a.args || []);
        }, m.pushQueue = function (a) {
            return m.queues[a.queue || 0] = m.queues[a.queue || 0] || [], m.queues[a.queue || 0].push(a), m;
        }, m.queue = function (a, b) {
            return typeof a === 'function' && (a = {callback: a}), typeof b !== 'undefined' && (a.queue = b), m.busy() ? m.pushQueue(a) : m.fireQueueItem(a), m;
        }, m.clearQueue = function () {
            return m.busy.flag = !1, m.queues = [], m;
        }, m.stateChanged = !1, m.doubleChecker = !1, m.doubleCheckComplete = function () {
            return m.stateChanged = !0, m.doubleCheckClear(), m;
        }, m.doubleCheckClear = function () {
            return m.doubleChecker && (h(m.doubleChecker), m.doubleChecker = !1), m;
        }, m.doubleCheck = function (a) {
            return m.stateChanged = !1, m.doubleCheckClear(), m.bugs.ieDoubleCheck && (m.doubleChecker = g(() => {
                return m.doubleCheckClear(), m.stateChanged || a(), !0;
            }, m.options.doubleCheckInterval)), m;
        }, m.safariStatePoll = function () {
            const b = m.extractState(d.location.href); let c; if (!m.isLastSavedState(b)) {
                c = b;
            } else {
                return;
            }

            return c || (c = m.createStateObject()), m.Adapter.trigger(a, 'popstate'), m;
        }, m.back = function (a) {
            return a !== !1 && m.busy() ? (m.pushQueue({scope: m, callback: m.back, args: arguments, queue: a}), !1) : (m.busy(!0), m.doubleCheck(() => {
                m.back(!1);
            }), n.go(-1), !0);
        }, m.forward = function (a) {
            return a !== !1 && m.busy() ? (m.pushQueue({scope: m, callback: m.forward, args: arguments, queue: a}), !1) : (m.busy(!0), m.doubleCheck(() => {
                m.forward(!1);
            }), n.go(1), !0);
        }, m.go = function (a, b) {
            let c; if (a > 0) {
                for (c = 1; c <= a; ++c) {
                    m.forward(b);
                }
            } else {
                if (!(a < 0)) {
                    throw new Error('History.go: History.go requires a positive or negative integer passed.');
                }

                for (c = -1; c >= a; --c) {
                    m.back(b);
                }
            }

            return m;
        };

        if (m.emulated.pushState) {
            const o = function () {}; m.pushState = m.pushState || o, m.replaceState = m.replaceState || o;
        } else {
            m.onPopState = function (b, c) {
                let e = !1; let f = !1; let g; let h; return m.doubleCheckComplete(), g = m.getHash(), g ? (h = m.extractState(g || d.location.href, !0), h ? m.replaceState(h.data, h.title, h.url, !1) : (m.Adapter.trigger(a, 'anchorchange'), m.busy(!1)), m.expectedStateId = !1, !1) : (e = m.Adapter.extractEventData('state', b, c) || !1, e ? f = m.getStateById(e) : (m.expectedStateId ? f = m.getStateById(m.expectedStateId) : f = m.extractState(d.location.href)), f || (f = m.createStateObject(null, null, d.location.href)), m.expectedStateId = !1, m.isLastSavedState(f) ? (m.busy(!1), !1) : (m.storeState(f), m.saveState(f), m.setTitle(f), m.Adapter.trigger(a, 'statechange'), m.busy(!1), !0));
            }, m.Adapter.bind(a, 'popstate', m.onPopState), m.pushState = function (b, c, d, e) {
                if (m.getHashByUrl(d) && m.emulated.pushState) {
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
                }

                if (e !== !1 && m.busy()) {
                    return m.pushQueue({scope: m, callback: m.pushState, args: arguments, queue: e}), !1;
                }

                m.busy(!0); const f = m.createStateObject(b, c, d); return m.isLastSavedState(f) ? m.busy(!1) : (m.storeState(f), m.expectedStateId = f.id, n.pushState(f.id, f.title, f.url), m.Adapter.trigger(a, 'popstate')), !0;
            }, m.replaceState = function (b, c, d, e) {
                if (m.getHashByUrl(d) && m.emulated.pushState) {
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
                }

                if (e !== !1 && m.busy()) {
                    return m.pushQueue({scope: m, callback: m.replaceState, args: arguments, queue: e}), !1;
                }

                m.busy(!0); const f = m.createStateObject(b, c, d); return m.isLastSavedState(f) ? m.busy(!1) : (m.storeState(f), m.expectedStateId = f.id, n.replaceState(f.id, f.title, f.url), m.Adapter.trigger(a, 'popstate')), !0;
            };
        }

        if (f) {
            try {
                m.store = k.parse(f.getItem('History.store')) || {};
            } catch (error) {
                m.store = {};
            }

            m.normalizeStore();
        } else {
            m.store = {}, m.normalizeStore();
        }

        m.Adapter.bind(a, 'beforeunload', m.clearAllIntervals), m.Adapter.bind(a, 'unload', m.clearAllIntervals), m.saveState(m.storeState(m.extractState(d.location.href, !0))), f && (m.onUnload = function () {
            let a; let b; try {
                a = k.parse(f.getItem('History.store')) || {};
            } catch (error) {
                a = {};
            }

            a.idToState = a.idToState || {}, a.urlToId = a.urlToId || {}, a.stateToId = a.stateToId || {}; for (b in m.idToState) {
                if (!m.idToState.hasOwnProperty(b)) {
                    continue;
                }

                a.idToState[b] = m.idToState[b];
            }

            for (b in m.urlToId) {
                if (!m.urlToId.hasOwnProperty(b)) {
                    continue;
                }

                a.urlToId[b] = m.urlToId[b];
            }

            for (b in m.stateToId) {
                if (!m.stateToId.hasOwnProperty(b)) {
                    continue;
                }

                a.stateToId[b] = m.stateToId[b];
            }

            m.store = a, m.normalizeStore(), f.setItem('History.store', k.stringify(a));
        }, m.intervalList.push(i(m.onUnload, m.options.storeInterval)), m.Adapter.bind(a, 'beforeunload', m.onUnload), m.Adapter.bind(a, 'unload', m.onUnload)); if (!m.emulated.pushState) {
            m.bugs.safariPoll && m.intervalList.push(i(m.safariStatePoll, m.options.safariPollInterval)); if (e.vendor === 'Apple Computer, Inc.' || (e.appCodeName || '') === 'Mozilla') {
                m.Adapter.bind(a, 'hashchange', () => {
                    m.Adapter.trigger(a, 'popstate');
                }), m.getHash() && m.Adapter.onDomLoad(() => {
                    m.Adapter.trigger(a, 'hashchange');
                });
            }
        }
    }, m.init();
})(window);
