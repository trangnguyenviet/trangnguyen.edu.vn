/**
 * Created by tanmv 2017-04-01
 *
 */

'use strict';
const logger = require('tracer').colorConsole();
let mongoose = require ("mongoose");
let Counters = require('./Counters');
module.exports = exports = (schema, options) => {
	schema.add({ created_at: Date });
	schema.add({ updated_at: Date });

	schema.pre('save', function (next) {
		let date = new Date();
		if(!this.created_at) this.created_at = date;
		if(!this.updated_at) this.created_at = date;

		if(schema.path('_id') && !this._id){
			if(schema.path('_id').instance==='Number' && schema.path('_id').options.inc){
				let self = this;
				Counters.findAndModify({_id:options.col_name},{},{$inc:{seq:1}},{new:true,upsert: true},(err,info)=>{
					if(err){
						throw err;
					}
					else{
						if(info.ok){
							self._id = info.value.seq;
							next();
						}
						else{
							throw new Error('inc error: ' + options.col_name);
						}
					}
				});
			}
			else if(schema.path('_id').instance==='ObjectID'){
				this._id = new mongoose.Types.ObjectId();
				next()
			}
			else{
				next(new Error('must input _id'));
			}
		}
		else{
			next()
		}
	});

	schema.pre('update', function (next) {
		if(this._update && this._update.$set){
			this._update.$set.updated_at = new Date();
		}
		next()
	});

	// schema.pre('find', function() {
	// 	console.log('find:', this);
	// });
	// schema.post('init', function(doc) {
	// 	console.log('%s has been initialized from the db', doc._id);
	// });
	// schema.post('validate', function(doc) {
	// 	console.log('%s has been validated (but not saved yet)', doc._id);
	// });
	// schema.post('save', function(doc) {
	// 	//this = doc
	// 	console.log('saved:', doc);
	// });
	// schema.post('update', function(CommandResult,next) {
	// 	//this = query
	// 	console.log('updated', this);
	// });
	// schema.post('remove', function(doc) {
	// 	console.log('removed:',doc);
	// });
	// if (options && options.index) {
	// 	schema.path('lastMod').index(options.index)
	// }
};