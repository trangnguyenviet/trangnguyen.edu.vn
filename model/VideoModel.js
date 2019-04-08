'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/*
Type: String Number Date Buffer Boolean Mixed Objectid Array
*/

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	video_type: String,
	name: String,
	parent_id: Number,
	parent_name: String,
	name_ko_dau: String,
	url: String,
	sort: Number,
	thumb: String,
	description: String,
	tags: [String],
	content: String,

	duration: Number,
	duration_view: String,
	bitrate: Number,
	width: Number,
	height: Number,
	format_name: String,
	codec_name: String,

	i_view: Number,
	i_like: Number,
	total_like: Number,

	create_by: Number,
	is_publish_date: {type: Boolean, default: false},
	publish_at: Date,
	publish_end: Date,
	active: {type: Boolean, default: true},

	deleted: {type: Boolean, default: false},
	delete_by: Number,
});

const col_name = 'videos';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);