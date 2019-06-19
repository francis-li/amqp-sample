const amqp = require('amqplib');

// ---

/**
 * @summary Cached AMQP channel
 * @type AMQP::ConfirmChannel
 */
let channel = null;

// ---

/**
 * @summary Gets the AMQP URI
 * @desc http://www.rabbitmq.com/uri-spec.html
 * @returns {string} AMQP URI
 */
function uri() {
  const { AMQP_HOST, AMQP_PASS, AMQP_PORT, AMQP_USER, AMQP_VHOST } = process.env;

  return `amqp://${AMQP_USER}:${AMQP_PASS}@${AMQP_HOST}:${AMQP_PORT}/${AMQP_VHOST}`;
}

/**
 * @summary Converts an object to a buffer
 * @param {object} obj Object
 * @returns {buffer} Buffer
 */
function obj2buffer(obj) {
  return Buffer.from(JSON.stringify(obj));
}

// ---

/**
 * @summary Creates a confirm channel
 * or returns an existing one from cache
 * @returns {undefined} Nothing
 */
async function createChannel() {
  try {
    if (channel !== null) return channel;

    const connection = await amqp.connect(uri());

    // NOTE: In production, connection event handlers
    // should be attached here. See API Reference for
    // a complete list of emitted events.

    channel = await connection.createConfirmChannel();

    // NOTE: In production, channel event handlers
    // should be attached here. See API Reference for
    // a complete list of emitted events.
  }
  catch (e) {
    return e;
  }
}

/**
 * @summary Publishes a message
 * @desc The exchange and message options are hard-coded
 * in this example. Tweak or abstract them as needed.
 * @param {string} exchange Exchange name
 * @param {object} message Message
 * @returns {undefined} Nothing
 */
async function publishMessage(exchange, message) {
  try {
    await createChannel();

    await channel.assertExchange(
      exchange, 'fanout', { autoDelete: true, durable: true }
    );
    
    channel.publish(
      exchange, '', obj2buffer(message), { peristent: true }
    );

    // NOTE: `waitForConfirms` ensures that this function
    // only resolves once the message is ack'd by the server.

    // https://www.squaremobius.net/amqp.node/channel_api.html#flowcontrol

    await channel.waitForConfirms();
  }
  catch (e) {
    return e;
  }
}

/**
 * @summary Asserts and binds a queue to an exchange
 * @desc The exchange and queue options are hard-coded
 * in this example. Tweak or abstract them as needed.
 * @param {string} exchange Exchange name
 * @param {string} queue Queue name
 * @returns {undefined} Nothing
 */
async function assertAndBindQueue(exchange, queue) {
  try {
    await createChannel();

    await channel.assertExchange(
      exchange, 'fanout', { autoDelete: true, durable: true }
    );

    await channel.assertQueue(
      queue, { autoDelete: true, durable: true }
    );

    await channel.bindQueue(
      queue, exchange, ''
    );
  }
  catch (e) {
    return e;
  }
}

/**
 * @summary Starts a consumer
 * @param {string} exchange Exchange name
 * @param {string} queue Queue name
 * @param {function} callback Message handler
 * @returns {undefined} Nothing
 */
async function startConsumer(exchange, queue, callback) {
  try {
    await assertAndBindQueue(exchange, queue);

    // NOTE: This parameter ensures that the NodeJS process associated
    // with the consumer only handles n-number of unacknowledged messages
    // at a given time (where n = prefetch count). This is particularly
    // important to set in the case of NodeJS due to the 'asynchronous'
    // nature of the event loop. If the prefetch count is unbounded, we
    // may run the risk of exhausting IO's/resources on the host. For
    // scaling out, one may consider a combination of increasing the
    // prefetch count and increasing the number of consumer instances.

    channel.prefetch(1);
  
    channel.consume(queue, message => {
      const content = JSON.parse(
        message.content.toString()
      );
  
      callback(content).then(() => {
  
        channel.ack(message);
  
      }, err => {

        // NOTE: In this example, we are choosing to
        // re-queue the message if the callback decides
        // to reject it. One may also consider sending
        // the message to another exchange dedicated to
        // tracking rejected messages.
  
        channel.nack(message, true);
  
      });
    });
  }
  catch (e) {
    return e;
  }
}

module.exports = {
  publishMessage,
  startConsumer
};
