var ParamsModel = require('../model/ParamsModel');

function Params(callback){
	var seft = this;
	this.map={};
	this.loadData(function(data){
		if(callback) callback(seft);
	});
	return this;
}

Params.prototype.loadData = function(callback){
	var self = this;
	ParamsModel.find({}).select('_id value').exec(function(err,list){
		if(err){
			console.log(err);
		}
		else{
			self.map={};
			if(list && list.length>0){
				for(var i=0;i<list.length;i++){
					var param_obj = list[i];
					self.map[param_obj._id] = param_obj.value;
				}
			}
			if(callback) callback(self.map);
		}
	});
};

Params.prototype.getMap = function(){
	return this.map;
};

Params.prototype.getValue = function(key){
	return this.map[key];
};

module.exports = Params;