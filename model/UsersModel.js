'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/*
Type: String,Number,Date,Buffer,Boolean,Mixed,Objectid,Array
*/

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	name: String,
	username: { type: String, index: true, required: true, unique: true },
	password: { type: String, index: true, select: false, required: true },
	email: String,
	mobile: String,
	sex: Boolean,
	birthday:Date,

	province_id: Number,
	province_name:String,
	district_id: Number,
	district_name: String,
	school_id: Number,
	school_name: String,
	class_id: {type: Number, min: 1, max: 6},
	class_name: String,
	address: String,

	current_round_1: { type: Number, default: 0},
	total_score_1: { type: Number, default: 0},
	total_time_1: { type: Number, default: 0},

	current_round_2: { type: Number, default: 0},
	total_score_2: { type: Number, default: 0},
	total_time_2: { type: Number, default: 0},

	current_round_3: { type: Number, default: 0},
	total_score_3: { type: Number, default: 0},
	total_time_3: { type: Number, default: 0},

	current_round_4: { type: Number, default: 0},
	total_score_4: { type: Number, default: 0},
	total_time_4: { type: Number, default: 0},

	award: Number,

	//money:{type:Number, default:0},
	vip_expire: Date,

	//last_login: Date,
	//last_login_ip: String,
	active: {type: Boolean, default: true},
	// active_email: {type: Boolean, default: false},
	// active_phone: {type: Boolean, default: false},

	banned: {type: Boolean, default: false},
	deleted: {type: Boolean, default: false},

	is_event_16: {type: Boolean, default: false},

	exam_school: {type: Boolean, default: false},
	exam_district: {type: Boolean, default: false},
	exam_province: {type: Boolean, default: false},
	exam_national: {type: Boolean, default: false},

	marks: [String]
});

schema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

const col_name = 'users';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);