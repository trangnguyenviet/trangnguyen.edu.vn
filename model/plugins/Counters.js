/**
 * Created by tanmv on 2017-04-01
 */
'use strict';

let mongoose = require ("mongoose");
let Schema = mongoose.Schema;

let schema = new Schema({
	// _id: { type: String, index: true, unique: true},
	_id: String,
	seq: Number
});

schema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
}
schema.set('autoIndex', false);
// schema.index({ _id: 1},{unique: true, background: true, sparse: true});
let col_name = 'counters';
module.exports = mongoose.model(col_name, schema);