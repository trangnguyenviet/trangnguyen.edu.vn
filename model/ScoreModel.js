'use strict';
const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	user_id: Number,
	type_id: Number,//{type: Number, default: 4},
	round_id: Number,//{type: Number, min: 1, max: 19},
	score: Number,//{type: Number, min: 0, max: 300},
	time: Number,//{type: Number, min: 0, max: 12000},
	luot: {type: Number, default:1},
	code: String,
	ip: String,
	token: String,
	client_info: Schema.Types.Mixed
});

const col_name = 'scores';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);