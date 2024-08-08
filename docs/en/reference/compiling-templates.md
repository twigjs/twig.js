# Compiling Templates

## CLI

Twig.js templates can be compiled into output JS files through the twigjs command. Currently the output is a tokenized form of the template, but in future the template will be transformed into a JavaScript file.

The syntax for the twigjs command is:

```bash
twigjs [options] input.twig | directory ...
_______________________________________________________________________________

twigjs can take a list of files and/or a directories as input. If a file is
provided, it is compiled, if a directory is provided, all files matching *.twig
in the directory are compiled. The pattern can be overridden with --pattern

--help         Print this help message.

--output ...   What directory should twigjs output to. By default twigjs will
               write to the same directory as the input file.

--module ...   Should the output be written in module format. Supported formats:
                   node:  Node.js / CommonJS 1.1 modules
                   amd:   RequireJS / Asynchronous modules (requires --twig)
                   cjs2:  CommonJS 2.0 draft8 modules (requires --twig)

--twig ...     Used with --module. The location relative to the output directory
               of twig.js. (used for module dependency resolution).

--pattern ...  If parsing a directory of files, what files should be compiled.
               Defaults to *.twig.
```

## Common use cases

### Create templates to include in a web site

To transform a directory of twig files into a directory of js files to include using script tags, you can use the following command:

```bash
twigjs --output templates/ src/
```

This will take all `*.twig` files in the `src/` directory and it's subdirectories and output them into the `templates` directory following the same directory structure and adding `.js` to the filenames.

See the `demos/compiler/basic` demo for a usage example.

### Create templates that can be required with Node.js

To create JS template files that can be included in Node.js with `require` you can specify the output module format with the `--module` flag.

```bash
twigjs --module node --output templates/ src/
```

This will output JS template files that export the Twig template so you can use it with:

```bash
var template = require("./templates/block.twig").template;

```

Note that these template are compliant with the CommonJS Modules/1.1 spec, so they can be used in any environment which support such modules. The only requirement is that `require("twig")` resolves to the Twig.js library.

See the `demos/compiler/node` demo for a usage example.
