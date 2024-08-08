# Contributing

There are a few steps to take to get twig.js building in your environment.


## Requirements

In order work on twig.js you will need node installed to run the tests and create the minified version of twig.js

## Building

1. Fork and clone the twig.js git repository
2. Run npm install to install the development dependencies
3. Make your changes to the source files in src/
4. Add/update tests in test/
5. Run npm test to make sure your tests pass.
6. Run npm build to build the source.


## Contributing

1. If possible, create tests (in the test/ directory) which test your changes. E.g. if you found and fixed a bug, create a test which fails in the buggy version.
2. Please commit only changes in the source code, not in the built files like twig.js, twig.min.js, etc. as they blow up the repository and create conflicts when merging pull requests. We build a final file when releasing a new version.
3. If possible, rebase your changes to the current master.
4. Tidy up your commit history. I think it's important to have distinct commits, so that you can follow development process, but readability suffers from too many commits just fixing stuff.
5. Push a branch to your fork on Github, create a pull request there.

