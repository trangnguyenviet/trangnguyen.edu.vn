'use strict';

/**
 * File: RabbitMq
 * Created by: tanmv
 * Date: 30/11/2018
 * Time: 22:04
 *
 */

const config = require('../config/config');
const amqp = require('amqp');

const connection = amqp.createConnection(config.rabbitMq);

connection.on('error', function(e) {
	console.log("Error from amqp: ", e);
});

connection.on('ready', function () {
	console.log("RabbitMq connected");
});

module.exports = {
	publish: (channel, message) => {
		connection.publish(channel, message, {contentType: 'application/json'})
	}
};