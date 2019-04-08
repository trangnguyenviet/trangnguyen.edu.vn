'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
	_id: { type: String, index: true, unique: true},
	name: String,
	value: Schema.Types.Mixed
});

const col_name = 'params';
schema.set('autoIndex', false);
module.exports = mongoose.model(col_name, schema);