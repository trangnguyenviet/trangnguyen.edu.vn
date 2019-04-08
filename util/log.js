var fs = require('fs');

function Log(dir){
	this.dir = dir;
	fs.existsSync(dir) || fs.mkdirSync(dir);
}

Log.prototype.info=function(s){
	var date = new Date();
	var sY = date.getFullYear();
	var sM = date.getMonth()<10?'0' + (date.getMonth()+1):date.getMonth()+1;
	var sD = date.getDate();
	var file_name = ''+sY+sM+sD;
	var log_file = fs.createWriteStream(this.dir + '/' + file_name + '.log', {flags : 'a'});
	var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	log_file.write(time + ' [info] ' + s + '\n');
};

Log.prototype.error=function(s){
	var date = new Date();
	var sY = date.getFullYear();
	var sM = date.getMonth()<10?'0' + (date.getMonth()+1):date.getMonth()+1;
	var sD = date.getDate();
	var file_name = ''+sY+sM+sD;
	var log_file = fs.createWriteStream(this.dir + '/' + file_name + '.log', {flags : 'a'});
	var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	log_file.write(time + ' [error] ' + s + '\n');
}

module.exports = Log;