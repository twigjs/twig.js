Version 0.8.9, to be released
-----------------------------
Dependencies have been updated to current versions. You should run `npm install` to update these. (#313)

Major improvements:
* Twig's `source` function is now supported (#309)
* It is possible to add additional parsers using Twig.Templates.registerParser() (currently available: twig, source). If you are using a custom loader, please investigate src/twig.loader.fs.js how to call the requested parser. (#309)
* `undefined` and `null` values now supported in the `in` operator (#311)
* Namespaces can now be defined using the '@' symbol (#328)

Minor improvements:
* Undefined object properties now have the value of `undefined` rather than `null` (#311)
* Improved browser tests (#325, #310)
* IE8 fix (#324)
* Path resolution has been refactored to its own module (#323)

Version 0.8.8, released 2016-02-13
----------------------------------
Major improvements:
* Support for [block shortcuts](http://twig.sensiolabs.org/doc/tags/extends.html#block-shortcuts): `{% block title page_title|title %}` (#304)
* Define custom template loaders, by registering them via `Twig.Templates.registerLoader()` (#301)

Minor improvements:
* Some mocha tests didn't  work in browsers (#281)
* Fix Twig.renderFile (#303)

[All issues of this milestone](https://github.com/justjohn/twig.js/issues?q=milestone%3A0.8.8)

Version 0.8.7, released 2016-01-20
----------------------------------
Major improvements:
* The `autoescape` option now supports all strategies which are supported by the `escape` filter (#299)

Minor improvements:
* The `date` filter now recognises unix timestamps as input, when they are passed as string (#296)
* The `default` filter now allows to be called without parameters (it will return an empty string in that case) (#295)
* Normalize provided template paths (this generated problems when using nodejs under Windows) (#252, #300)

Version 0.8.6, released 2016-01-05
----------------------------------
Major improvements:
* The `escape` filter now supports the strategy parameter: `{{ var|escape('css') }}` with the following available strategies: html (default), js, css, url, html_attr. (#289)

Minor improvements:
* The filter `url_encode` now also encodes apostrophe (as in Twig.php) (#288)
* Minor bugfixes (#290, #291)

Version 0.8.5, released 2015-12-24
----------------------------------
From 0.8.5 on, a summary of changes between each version will be included in the CHANGELOG.md file.

There were some changes to the [Contribution guidelines](https://github.com/justjohn/twig.js/wiki/Contributing): please commit only changes to source files, the files `twig.js` and `twig.min.js` will be rebuilt when a new version gets released. Therefore you need to run `make` after cloning resp. pulling (if you want to use the development version).

Major improvements:
* Implement `min` and `max` functions (#164)
* Support for the whitespace control modifier: `{{- -}}` (#266)
* `sort` filter: try to cast values to match type (numeric values to number, string otherwise) (#278)
* Support for twig namespaces (#195, #251)
* Support for expressions as object keys: `{% set foo = { (1 + 1): 'bar' } %}` (#284)

Minor improvements:
* Allow integer 0 as key in objects: `{ 0: "value" }` (#186)
* `json_encode` filter: always return objects in order of keys, also ignore the internal key `_keys` for nested objects (#279)
* `date` filter: update to current strtotime() function from phpjs: now support ISO8601 dates as input on Mozilla Firefox. (#276)
* Validate template IDs only when caching is enabled (#233, #259)
* Support xmlhttp.status==0 when using cordova (#240)
* Improved sub template file loading (#264)
* Ignore quotes between `{% raw %}` and `{% endraw %}` (#286)
