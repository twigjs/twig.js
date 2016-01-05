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
