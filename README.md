Courier Publish/Subscribe Module
================================

Usage - Functional Style
------------------------
```js
var publish = require("courier").publish,
    subscribe = require("courier").subscribe,
    undeliverable = requireq("courier").undeliverable,
    obj = {a:1};

// add a subscriber function to an object
subscribe(obj, function(msg) {});

// publish a message to all object subscribers
publish(obj, "Foo!");

// add a subscription channel by passing in extra argument
subscribe(obj, "FOO", function(msg) {});

// similarly, add an extra publish argument to publish to a channel
publish(obj, "FOO", "Foo!");

// when not subscribed published messages go nowhere
publish(obj, "BAR", "Bar!");    // no subscribers called

// unless you want them to fallback as an undeliverable message
undeliverable(obj, function(ch, msg) {});
```

Usage - Object Style
--------------------
```js
var courier = require("courier").courier,
    obj = {a:1};

// call the courier function to add a Courier to the object
courier(obj);

// subscribe using the object courier
obj.courier.subscribe(function(msg) {});

// subscribe to a courier channel
obj.courier.subscribe("FOO", function(msg) {});

// publish using the object courier
obj.courier.publish("Foo!");

// publish to a courier channel
obj.courier.publish("FOO", "Foo!");

// setup an undeliverable recipient
obj.courier.undeliverable(function(ch, msg) {});
```
