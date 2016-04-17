/**
 * Twig.js 0.8.9
 *
 * @copyright 2011-2016 John Roepke and the Twig.js Contributors
 * @license   Available under the BSD 2-Clause License
 * @link      https://github.com/twigjs/twig.js
 */

var Twig = {
    VERSION: '0.8.9'
};

require('./twig.core')(Twig);
require('./twig.compiler')(Twig);
require('./twig.expression')(Twig);
require('./twig.filters')(Twig);
require('./twig.functions')(Twig);
require('./twig.lib')(Twig);
require('./twig.loader.ajax')(Twig);
require('./twig.loader.fs')(Twig);
require('./twig.logic')(Twig);
require('./twig.parser.source')(Twig);
require('./twig.parser.twig')(Twig);
require('./twig.path')(Twig);
require('./twig.tests')(Twig);
require('./twig.exports')(Twig);

module.exports = Twig.exports;
