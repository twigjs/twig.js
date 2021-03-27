import { createRequire } from "https://deno.land/std@0.91.0/node/module.ts";
import strings  from 'https://cdn.skypack.dev/locutus/php/strings';
import math from 'https://cdn.skypack.dev/locutus/php/math';
import datetime from 'https://cdn.skypack.dev/locutus/php/datetime';
import boolval from 'https://cdn.skypack.dev/locutus/php/var/boolval';
const require = createRequire(import.meta.url);
export {strings, math, datetime, boolval}
export default require;