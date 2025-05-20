# Implementation Notes

## Differences / Implementation Notes

- named arguments (e.g. `|filter(param = value)`) are not supported. See [#410](https://github.com/twigjs/twig.js/issues/410)
- currently twig.js does not have the same auto-escaping that Twig does.

## Feature Support

### Built-in Tags

Docs: [Twig 3.x tags](https://twig.symfony.com/doc/3.x/tags/index.html) <br>
Example syntax: `{% tagName %}`

- `apply`: ???
- `autoescape`: ???
- `block`: Supported
- `cache`: ???
- `deprecated`: ???
- `do`: ???
- `embed`: Supported
- `extends`: Supported
- `flush`: N/A
- `for`: Supported
- `from`: Supported
- `if`: Supported
- `import`: Supported
- `include`: Supported
- `macro`: Supported
- `sandbox`: ???
- `set`: Supported
- `use`: Supported
- `verbatim`: Supported
- `with`: Supported

### Built-in Filters

Docs: [Twig 3.x filters](https://twig.symfony.com/doc/3.x/filters/index.html) <br>
Example syntax: <span v-pre>`{{ variable|filterName }}`</span>

- `abs`: Supported
- `batch`: Supported
- `capitalize`: Supported
- `column`: ???
- `convert_encoding`: N/A
- `country_name`: ???
- `currency_name`: ???
- `currency_symbol`: ???
- `data_uri`: ???
- `date`: Supported
- `date_modify`: Supported
- `default`: Supported
- `escape`: Supported
- `filter`: Supported
- `first`: Supported
- `format`: Supported
- `format_currency`: ???
- `format_date`: ???
- `format_datetime`: ???
- `format_number`: ???
- `format_time`: ???
- `html_to_markdown`: ???
- `inky_to_html`: ???
- `inline_css`: ???
- `join`: Supported
- `json_encode`: Supported
- `keys`: Supported
- `language_name`: ???
- `last`: Supported
- `length`: Supported
- `locale_name`: ???
- `lower`: Supported
- `map`: ???
- `markdown_to_html`: ???
- `merge`: Supported
- `nl2br`: Supported
- `number_format`: Supported
- `raw`: ???
- `replace`: Supported
- `reverse`: Supported
- `round`: Supported
- `slice`: Supported
- `sort`: Supported
- `spaceless`: Supported
- `split`: Supported
- `striptags`: Supported
- `timezone_name`: ???
- `title`: Supported
- `trim`: Supported
- `u`: ???
- `upper`: Supported
- `url_encode`: Supported

### Built-in Functions

Docs: [Twig 3.x functions](https://twig.symfony.com/doc/3.x/functions/index.html) <br>
Example syntax: <span v-pre>`{{ functionName(arguments) }}`</span>

- `attribute`: ???
- `block`: ???
- `constant`: ???
- `cycle`: ???
- `date`: ???
- `dump`: ???
- `html_classes`: ???
- `include`: Throws error: "include function does not exist and is not defined in the context" https://github.com/twigjs/twig.js/issues/392
- `max`: ???
- `min`: ???
- `parent`: ???
- `random`: ???
- `range`: ???
- `source`: ???
- `country_timezones`: ???
- `template_from_string`: ???

### Built-in Tests

Docs: [Twig 3.x tests](https://twig.symfony.com/doc/3.x/tests/index.html) <br>
Example syntax: <span v-pre>`{{ expression is testName }}`</span>

- `constant`:
- `defined`: Supported
- `divisibleby`: Supported
- `empty`: Supported
- `even`: Supported
- `iterable`: Supported
- `null` / `none`: Supported
- `odd`: Supported
- `sameas`: Supported

### Built-in Operators

Docs: [Twig 3.x operators](https://twig.symfony.com/doc/3.x/templates.html#expressions) <br>
Example syntax: <span v-pre>`{{ expression operator expression }}`</span>

- `in`: Supported
- `is`: Supported
- Math (`+`, `-`, `/`, `%`, `*`, `**`): Supported
- Logic (`and`, `or`, `not`, `()`): Supported
- Bitwise (`b-and`, `b-or`, `b-xor`): Supported
- Comparisons (`==`, `!=`, `<`, `>`, `>=`, `<=`, `===`): Supported
- Others (`..`, `|`, `~`, `.`, `[]`, `?:`): Supported
- Null-coalescing (`??`): Supported