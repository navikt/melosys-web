const fnv1a = require('@sindresorhus/fnv1a');

export const hash = str => fnv1a(str);
