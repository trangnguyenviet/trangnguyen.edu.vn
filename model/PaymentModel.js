'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/*Type:String Number Date Buffer Boolean Schema.Types.Mixed Objectid Array*/

const schema = new Schema({
	// _id: { type: Number, default: 0},//index: true,
	_id: Schema.Types.ObjectId,
	user_id: Number,
	type: String,
	form: Schema.Types.Mixed,

	res_error: Schema.Types.Mixed,
	res_status: String,
	done: {type:Boolean, default: false},
	res_body: String,
	res_statusCode: String,

	//card number
	card_number: String,
	card_serial: String,
	network: String,

	amout: {type: Number, default: 0},
	tn_amout: {type: Number, default: 0},
	transaction_id: {type: Number, default: 0},

	token_code: String,
	response_code: String,
	is_check: {type:Boolean, default: false},
	bank_code: String,
});

const col_name = 'payments';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);