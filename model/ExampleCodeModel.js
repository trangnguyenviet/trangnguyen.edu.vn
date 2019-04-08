'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

// create a schema
const schema = new Schema({
	_id: String,
	type: String,
	class_id: String,
	province_id: Number,
	district_id: Number,
	school_id: Number,
	begin_use: Number,
	end_use: Number,
	active: Boolean
});

const col_name = 'example_codes';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);