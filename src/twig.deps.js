import { createRequire } from "module";
import strings  from 'locutus/php/strings/index.js';
import math from 'locutus/php/math/index.js';
import datetime from 'locutus/php/datetime/index.js';
import boolval from 'locutus/php/var/boolval.js';
const require = createRequire(import.meta.url);
export {strings, math, datetime, boolval}
export default require;