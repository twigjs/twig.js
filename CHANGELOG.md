Changes since 0.8.4
-------------------
Mayor improvements:
* Implement `min` and `max` functions (#164)
* Support for the whitespace control modifier: `{{- -}}` (#266)
* `sort` filter: try to cast values to match type (numeric values to number, string otherwise) (#278, plepe#1)
* Support for twig namespaces (#195, #251)

Minor improvements:
* Allow integer 0 as key in objects: `{ 0: "value" }` (#186)
* `json_encode` filter: always return objects in order of keys, also ignore the internal key `_keys` for nested objects (#279)
* `date` filter: update to current strtotime() function from phpjs: now support ISO8601 dates as input on Mozilla Firefox. (#276)
* `default` filter: now takes no parameters (use empty string) (#267)
* Validate template IDs only when caching is enabled (#233, #259)
* Support xmlhttp.status==0 when using cordova (#240)
* Improved sub template file loading (#264)
