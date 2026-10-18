# Upgrading

This covers how to upgrade between versions when there are breaking changes. General changelog notices can be found on the [Releases page on GitHub](https://github.com/twigjs/twig.js/releases).

## Unreleased

- Operator precedence now follows the table of Twig 4 ([operators_precedence.rst](https://github.com/twigphp/Twig/blob/b336924298d65a90f1016bc6ef77548651da23e0/doc/operators_precedence.rst)). Expressions that mix operators without parentheses can give different results:
  - `**` binds tighter than `*` and `not`, and is right associative: `2 * 3 ** 2` is `18` (was `36`), `2 ** 2 ** 3` is `256` (was `64`).
  - `~` binds looser than `+` and `-`: `1 ~ 2 + 30` is `132` (was `42`).
  - `..` binds tighter than `in`: `2 in 1..3` is `true` (was an empty array). `in` and `==` share one level: `1 == 2 in [false]` is `true` (was `false`).
  - `??` and `?:` share one level and group right to left: `0 ?? 1 ?: 2` is `0` (was `2`), `1 ? 0 ?: 5 : 9` is `5` (was `0`).
  - Add parentheses where you relied on the old order.

## 3.0.0

- Ensure you are using Node.js >= 22

## 2.0.0

- Ensure you are using Node.js >= 20
