'use strict';

/**
 * File: Sessions
 * Created by: tanmv
 * Date: 25/12/2018
 * Time: 16:52
 * Template by tanmv
 */

const mongoose = require('mongoose');
const BasePlugins = require('./plugins/BasePlugins');

const Schema = mongoose.Schema;

const schema = new Schema({
	_id: {type: Number, inc: true},
	name: String,
	alias: String
});

// schema.statics.findAndModify = (query, sort, doc, options, callback) => {
// 	return this.collection.findAndModify(query, sort, doc, options, callback);
// };

const col_name = 'sessions';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name, db});

export default db.model(col_name, schema);
module.exports = mongoose.model(col_name, schema);