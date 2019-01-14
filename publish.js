const amqp = require('./lib/amqp');

// ---

require('dotenv').config();

// ---

const MESSAGE = {
  'McLaren': 'Speedtail'
};

// ---

async function main() {
  try {
    console.log('Publishing message...');

    const { AMQP_EXCHANGE } = process.env;

    await amqp.publishMessage(
      AMQP_EXCHANGE, MESSAGE
    );

    console.log('Message published!');

    process.exit();
  }
  catch (err) {
    debug(err);

    process.exit(1);
  }
}

// ---

main();
