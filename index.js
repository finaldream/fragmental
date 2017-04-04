/**
 * Static entry-point.
 *
 * @author Oliver Erdmann, <o.erdmann@finaldream.de>
 * @since 03.04.2017
 */

'use strict';

const FragmentStore = require('./src/FragmentStore');

const store = new FragmentStore();

module.exports.store = store;
module.exports.registerFragment = store.registerFragment;
module.exports.resolveQuery = store.resolveQuery;
