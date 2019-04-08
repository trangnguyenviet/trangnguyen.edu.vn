'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/* Type: String Number Date Buffer Boolean Mixed Objectid Array */
// create a schema
const schema = new Schema({
	//_id: Number
	user_id: Number,
	url: String,
	method: String,
	ip: String,
	request: Schema.Types.Mixed,
	response: Schema.Types.Mixed,
});

const col_name = 'log_requests';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);