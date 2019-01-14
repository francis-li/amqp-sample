# amqp-sample

An example of how to use AMQP with NodeJS.

## Getting Started

1) Copy `.env.template` and rename it `.env` .
2) Open `.env` and set the appropriate values.
3) In a terminal, start the consumer: `$ yarn run consume`
4) In another terminal, publish a message: `$ yarn run publish`

## Considerations

* The purpose of this example is to illustrate a simple end-to-end implementation of the AMQP publisher/subscriber workflow in NodeJS. To simplify things, assumptions have been made for exchange, queue and message options. These options may been tweaked or abstracted as needed.

* Do I need to keep opening terminals to start additional consumers? Nope! Process managers like `pm2` or `supervisord` can help you manage them with ease.

* Keep in mind that resource usage (CPU, memory, database connections, etc.) increases with the number of active consumers - don't go to town blindly!

## Further Readings

[AMQP Concepts](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

[API Reference](http://www.squaremobius.net/amqp.node/channel_api.html)