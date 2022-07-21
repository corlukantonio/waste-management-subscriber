/**
 * The Handler interface declares a method for building the chain of handlers. It also declares a method for executing a request.
 *
 * @interface
 */
class MqttMessageHandler {
  /**
   * Set next.
   *
   * @param {MqttMessageHandler} handler Handler.
   * @return {MqttMessageHandler} MQTT message handler.
   */
  setNext(handler) {
    throw new Error('Needs to be implemented by the subclass.');
  }

  /**
   * Handle.
   *
   * @param {Buffer} msg Message.
   * @return {boolean} True or false.
   */
  handle(msg) {
    throw new Error('Needs to be implemented by the subclass.');
  }
}

module.exports = MqttMessageHandler;
