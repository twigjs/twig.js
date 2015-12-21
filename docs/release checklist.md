Steps to release twig.js

1. Update version in package.json
2. Update version in bower.json
3. Update version in src/twig.header.js
4. `make`, `make test` and commit the changes.
5. `git tag` new version

## bower

Bower will pick up the new version inm bower.json and use the associated tag.

## npm

To publish the latest version to npmjs.org run this command from the twig.js directory:

    npm publish
