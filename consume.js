const amqp = require('./lib/amqp');

// ---

require('dotenv').config();

// ---

function callback(message) {
  console.log(`Received message: ${JSON.stringify(message)}`);
  
  return Promise.resolve();
}

// ---

function main() {
  console.log('Starting consumer... (ctrl-c to stop)');

  const { AMQP_EXCHANGE, AMQP_QUEUE } = process.env;

  amqp.startConsumer(
    AMQP_EXCHANGE, AMQP_QUEUE, callback
  );
}

// ---

main();
