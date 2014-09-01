var prop = require("propertize");

/**
 * @param {object} scope
 * @constructor
 */
function Courier(scope) {
    prop.readonly(this, "scope", scope);
    prop.readonly(this, "subscribers", []);
    prop.readonly(this, "undeliverables", []);
    prop.readonly(this, "channels", {});
}

/**
 * Publish a message to this courier.  Optionally, set a channel.
 * @param {string} [ch]
 * @param {*} [msg]
 */
Courier.prototype.publish = function(ch, msg) {
    if (arguments.length < 2) msg = ch, ch = null;
    
    var scope = this.scope,
        subs = ch === null ? this.subscribers : (this.channels[ch] || []);
    
    if (subs.length === 0)
        this.undeliverables.forEach(function(subscriber) {
            subscriber.call(scope, ch, msg);
        });
    else
        subs.forEach(function(subscriber) {
            subscriber.call(scope, msg);
        });
};

/**
 * Subscribe to messages from this courier.  Optionall, subscribe to a specified
 * channel.
 * @param {string} [ch]
 * @param {function} subscriber
 */
Courier.prototype.subscribe = function(ch, subscriber) {
    if (arguments.length < 2) subscriber = ch, ch = null;
    
    if (ch !== null) this.channels[ch] = this.channels[ch] || [];
    (ch === null ? this.subscribers : this.channels[ch]).push(subscriber);
};

/**
 * Subscribe to otherwise undeliverable messages from this courier.
 * @param {function} subscriber
 */
Courier.prototype.undeliverable = function(subscriber) {
    this.undeliverables.push(subscriber);
};

/**
 * Add a courier to the provided object and return the modified object.
 * @param {object} obj
 * @returns {object}
 */
function courier(obj) {
    if (!obj.courier) prop.hidden(obj, "courier", new Courier(obj));
    return obj;
}

/**
 * Publish a message using the object's courier.  Optionally, set a channel for
 * the message.
 * @param {object} obj
 * @param {string} [ch]
 * @param {*} [msg]
 */
function publish(obj, ch, msg) {
    if (arguments.length < 3) msg = ch, ch = null;
    courier(obj).courier.publish(ch, msg);
}

/**
 * Subscribe to messages delivered by the object's courier.  A channel may be
 * specified to receive messages for that channel.
 * @param {object} obj
 * @param {string} [ch]
 * @param {function} subscriber
 */
function subscribe(obj, ch, subscriber) {
    if(arguments.length < 3) subscriber = ch, ch = null;
    courier(obj).courier.subscribe(ch, subscriber);
}

/**
 * Subscribe to otherwise undeliverable messages from the object's courier.
 * @param {object} obj
 * @param {function} subscriber
 */
function undeliverable(obj, subscriber) {
    courier(obj).courier.undeliverable(subscriber);
}

/** module exports */
module.exports = {
    Courier: Courier,
    courier: courier,
    publish: publish,
    subscribe: subscribe,
    undeliverable: undeliverable
};
