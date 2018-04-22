/**
 * twig.production.js
 *
 * This entrypoint excludes all code that compiles templates, resulting in a
 * smaller bundle which can be used when templates are pre-compiled.
 *
 * @copyright 2011-2016 John Roepke and the Twig.js Contributors
 * @license   Available under the BSD 2-Clause License
 * @link      https://github.com/twigjs/twig.js
 */

var Twig = require('./twig.init');
require('./twig.core')(Twig);
require('./twig.template')(Twig);
require('./twig.expression')(Twig);
require('./twig.expression.operator')(Twig);
require('./twig.expression.definitions.parse')(Twig);
require('./twig.filters')(Twig);
require('./twig.functions')(Twig);
require('./twig.lib')(Twig);
require('./twig.logic')(Twig);
require('./twig.logic.definitions.parse')(Twig);
require('./twig.parser.source')(Twig);
require('./twig.parser.twig')(Twig);
require('./twig.tests')(Twig);
require('./twig.async')(Twig);
require('./twig.exports')(Twig);

module.exports = Twig.exports;
