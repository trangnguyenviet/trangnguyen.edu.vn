var config = require("../config/config");
var email = require("emailjs");

module.exports = {
	list_send:[],
	server: email.server.connect(config.email_config.server),
	message: {
		from: config.email_config.message.from,
		to:'',
		subject: config.email_config.message.subject,
		text: ''
	},
	setSubject: function(subject){
		this.message.subject=subject;
	},
	addReceiver: function(email){
		if(email) this.list_send.push(email);
	},
	setRecerver: function(list_recerver){
		if(list_recerver){
			if(typeof list_recerver == 'string'){
				//string
				this.list_send.push(list_recerver);
			}
			else{
				//array
				this.list_send=list_recerver;
			}
		}
	},
	send: function(text, callback){
		var message = this.message;
		message.to = this.list_send.join(',');
		message.text = text;

		this.server.send(message, function(err, message) {
			if(callback) callback(err,message);
		});
	}
}