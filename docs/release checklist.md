Steps to release twig.js

## repository

1. Compile list of changes in CHANGELOG.md
2. Update version in package.json
3. Update version in bower.json
4. Update version in src/twig.header.js
5. `make`, `make docs`, `make test` and commit the changes.
6. `git tag` new version

## bower

Bower will pick up the new version in bower.json and use the associated git tag.

## npm

To publish the latest version to npmjs.org run this command from the twig.js directory:

    npm publish
