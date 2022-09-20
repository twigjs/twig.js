import {createRequire} from "module";
import sprintf from 'locutus/php/strings/sprintf.js';
import vsprintf from 'locutus/php/strings/vsprintf.js';
import strip_tags from 'locutus/php/strings/strip_tags.js';
import round from 'locutus/php/math/round.js';
import max from 'locutus/php/math/max.js';
import min from 'locutus/php/math/min.js';
import strtotime  from 'locutus/php/datetime/strtotime.js';
import date from 'locutus/php/datetime/date.js';
import boolval from 'locutus/php/var/boolval.js';
import clm from 'countryLocaleMap';
import {Currencies} from 'currenciesMap';

const require = createRequire(Deno.realPathSync("."));
export {sprintf, vsprintf, strip_tags, round, min, max, date, strtotime, boolval, clm, Currencies}
export default require;
