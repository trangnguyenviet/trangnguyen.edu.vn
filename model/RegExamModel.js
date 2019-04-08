/**
 * Created by tanmv on 13/05/2017.
 */
'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

const schema = new Schema({
	user_id: Number,
	round_id: Number
});

const col_name = 'res_exams';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);