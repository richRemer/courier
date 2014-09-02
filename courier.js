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
        subs = ch === null || ch === undefined
            ? this.subscribers
            : (this.channels[ch] || []);
    
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
 * Unsubscribe one or more subscribers from the courier.  If the channel is null
 * or not specified, remove subscribers from the object.  If the channel is a
 * string, remove subscribers from the specified channel.  If the channel is
 * false, remove subscribers from the undeliverables.  If the channel is true,
 * remove subscribers from the object, all channels, and the undeliverables.  If
 * the subscriber is not provided, remove all subscribers, otherwise, just
 * remove the provided subscriber.
 * undeliverable list.
 * @param {string|boolean} [ch]
 * @param {function} [subscriber]
 */
Courier.prototype.unsubscribe = function(ch, subscriber) {
    if (typeof ch === "function") subscriber = ch, ch = null;
    
    var $this = this,
        subs = [],
        i;
    
    if (ch === true) {
        this.channels.forEach(function(v, ch) {
            $this.unsubscribe(ch, subscriber)
        });
        this.unsubscribe(null, subscriber);
        this.unsubscribe(false, subscriber);
    }
    
    else if (ch === false) subs = this.undeliverables;
    else if (ch === null || ch === undefined) subs = this.subscribers;
    else subs = this.channels[ch] || [];
    
    if (subscriber) {
        if ((i = subs.indexOf(subscriber)) >= 0)
            subs.splice(i, 1);
    } else {
        subs.splice(0, subs.length);
    }
}

/**
 * Forward messages from one object courier to another.
 * @param {string} [chsrc]
 * @param {object} dest
 * @param {string} [chdest]
 */
Courier.prototype.forward = function(chsrc, dest, chdest) {
    if (arguments.length === 1) dest = chsrc, chsrc = null;
    else if (arguments.length === 2) {
        if (typeof chsrc !== "string")
            chdest = dest, dest = chsrc, chsrc = null;
    }

    this.subscribe(chsrc, function(msg) {
        publish(dest, chdest, msg);
    });
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

/**
 * Unsubscribe from an object courier.
 * @param {object} obj
 * @param {string} [ch]
 * @param {function} [subscriber]
 */
function unsubscribe(obj, ch, subscriber) {
    if (typeof ch === "function") subscriber = ch, ch = null;
    courier(obj).courier.unsubscribe(ch, subscriber);
}

/**
 * Forward messages from one object courier to another.
 * @param {object} source
 * @param {string} [chsrc]
 * @param {object} dest
 * @param {string} [chdest]
 */
function forward(source, chsrc, dest, chdest) {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 3) {
        if (typeof dest === "string") chdest = dest, dest = chsrc, chsrc = null;
    } else if (args.length === 2) {
        dest = chsrc, chsrc = null;
    }
    
    courier(source).courier.forward(chsrc, dest, chdest);
}

/** module exports */
module.exports = {
    Courier: Courier,
    courier: courier,
    publish: publish,
    subscribe: subscribe,
    undeliverable: undeliverable,
    unsubscribe: unsubscribe,
    forward: forward
};
