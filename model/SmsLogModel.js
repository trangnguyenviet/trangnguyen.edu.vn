'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/*
Type: String,Number,Date,Buffer,Boolean,Mixed,Objectid,Array
*/

// create a schema
const schema = new Schema({
	// _id: { type: Number, inc: true},
	body: Schema.Types.Mixed
});

schema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

const col_name = 'sms_logs';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);