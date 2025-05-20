# Extending twig.js

There are several aspects of twig.js that can be extended with custom functionality.

They are:

1. Functions
2. Filters
3. Tests
4. Tags

## Functions

Custom functions can be added through `Twig.extendFunction(name, definition)`

For example, a function that repeats a value could look like:

```js
Twig.extendFunction("repeat", function(value, times) {
  return new Array(times + 1).join(value);
});
```

And you can use it in a template like:


```
{{ repeat("_.", 10) }}
{# output: _._._._._._._._._._. #}
```

## Filters

Custom filters can be added through `Twig.extendFilter(name, definition)`

For example, if you wanted to add a filter that reversed words in a sentence, you could do the following:

```js
Twig.extendFilter("backwords", function(value) {
    return value.split(" ").reverse().join(" ");
});
```

Then, in your templates you can use:



```
{{ "a quick brown fox"|backwords }}
outputs: fox brown quick a
```

Custom filters with arguments are also supported:

```js
Twig.extendFilter('catify', (value, args) =>
  args.reduce(
    (newString, toCatify) => newString.replace(toCatify, 'cat'),
    value
  )
);
```

```
{{ "the quick brown fox jumps over the lazy dog"|catify('fox', 'dog') }}
outputs: the quick brown cat jumps over the lazy cat
```
## Tests

## Tags

See [Extending twig.js with Custom Tags](https://github.com/justjohn/twig.js/wiki/Extending-twig.js-With-Custom-Tags)
