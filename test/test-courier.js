var courier = require(".."),
    expect = require("expect.js");

describe("courier", function() {
    var ch = "channel",
        msg = "message";

    describe(".Courier", function() {
        var scope = {},
            c = new courier.Courier(scope);
        
        it("should take a scope argument", function() {
            expect(c.scope).to.be(scope);
        });

        describe(".subscribe w/o channel", function() {
            it("should add subscriber to courier subscribers", function() {
                var sub = function() {};
                c.subscribe(sub);
                expect(c.subscribers).to.be.an("array");
                expect(c.subscribers.length).to.be(1);
                expect(c.subscribers[0]).to.be(sub);
            });
        });
        
        describe(".subscribe w/ channel", function() {
            it("should add subscriber to courier channel", function() {
                var sub = function() {};
                c.subscribe(ch, sub);
                expect(c.channels).to.be.an("object");
                expect(c.channels[ch]).to.be.an("array");
                expect(c.channels[ch].length).to.be(1);
                expect(c.channels[ch][0]).to.be(sub);
            });
        });
        
        describe(".publish w/o channel", function() {
            it("should deliver message to courier subscribers", function() {
                var delivered = false,
                    sub = function(message) {
                        delivered = true;
                        expect(message).to.be(msg);
                    };
                    
                c.subscribe(sub);
                c.publish(msg);
                expect(delivered).to.be(true);
            });
        });
        
        describe(".publish w/ channel", function() {
            it("should deliver message to channel subscribers", function() {
                var delivered = false,
                    sub = function(message) {
                        delivered = true;
                        expect(message).to.be(msg);
                    };
                
                c.subscribe(ch, sub);
                c.publish(ch, msg);
                expect(delivered).to.be(true);
            });
        });
        
        describe(".undeliverable", function() {
            it("should subscribe to undelivered messages", function() {
                var delivered = false,
                    sub = function(channel, message) {
                        delivered = true;
                        expect(message).to.be(msg);
                    };
                
                c.undeliverable(sub);
                c.publish("missing_channel", msg);
                expect(delivered).to.be(true);
            });
        });
        
        describe(".unsubscribe", function() {
            it("should unsubscribe a provided recipient", function() {
                var unsubscribed = true,
                    sub = function() {unsubscribed = false;};
                
                c.subscribe(sub);
                c.unsubscribe(sub);
                c.publish(msg);
                expect(unsubscribed).to.be(true);
            });
            
            it("should unsubscribe all recipients if none provided", function() {
                var unsubscribed = true,
                    sub = function() {unsubscribed = false;};
                
                c.subscribe(sub);
                c.unsubscribe();
                c.publish(msg);
                expect(unsubscribed).to.be(true);
            });
        });
        
        describe(".forward", function() {
            it("should forward messages to another object", function() {
                var forwarded = false,
                    sub = function() {forwarded = true;},
                    target = {};
                
                courier.subscribe(target, sub);
                c.forward(target);
                c.publish(msg);
                expect(forwarded).to.be(true);
            });
            
            it("should forward channel messages to another object", function() {
                var forwarded = false,
                    sub = function() {forwarded = true;},
                    target = {};
                
                courier.subscribe(target, sub);
                c.forward(ch, target);
                c.publish(ch, msg);
                expect(forwarded).to.be(true);
            });
            
            it("should optionally forward messages to a channel", function() {
                var forwarded = false,
                    sub = function() {forwarded = true;},
                    target = {};
                
                courier.subscribe(target, ch, sub);
                c.forward(target, ch);
                c.publish(msg);
                expect(forwarded).to.be(true);
            });
        });
    });

    describe(".courier", function() {
        it("should return the provided object", function() {
            var obj = {};
            expect(courier.courier(obj)).to.be(obj);
        });
        
        it("should set hidden 'courier' property", function() {
            var obj = {},
                hidden = true;
                
            courier.courier(obj);
            for (var prop in obj) if (prop === "courier") hidden = false;
            expect(obj.courier).to.be.an("object");
            expect(hidden).to.be(true);
        });
        
        it("should not overwrite existing 'courier' property", function() {
            var extant = {},
                obj = {courier: extant};
            courier.courier(obj);
            expect(obj.courier).to.be(extant);
        });
    });
    
    describe(".publish", function() {
        it("should add a courier to an object if not present", function() {
            var obj = {};
            courier.publish(obj, msg);
            expect(obj.courier).to.be.an("object");
        });
    
        it("should invoke an object courier's publish method", function() {
            var obj = {courier: {}},
                invoked = false;
                
            obj.courier.publish = function() {
                invoked = true;
            };
            
            courier.publish(obj, msg);
            expect(invoked).to.be(true);
        });
    });
    
    describe(".subscribe", function() {
        it("should add a courier to an object if not present", function() {
            var obj = {},
                sub = function() {};
                
            courier.subscribe(obj, sub);
            expect(obj.courier).to.be.an("object");
        });
    
        it("should invoke an object courier's subscribe method", function() {
            var obj = {courier: {}},
                sub = function() {},
                invoked = false;
            
            obj.courier.subscribe = function() {
                invoked = true;
            };
            
            courier.subscribe(obj, sub);
            expect(invoked).to.be(true);
        });
    });
    
    describe(".undeliverable", function() {
        it("should add a courier to an object if not present", function() {
            var obj = {},
                sub = function() {};
            
            courier.undeliverable(obj, sub);
            expect(obj.courier).to.be.an("object");
        });

        it("should invoke an object courier's undeliverable method", function() {
            var obj = {courier: {}},
                sub = function() {},
                invoked = false;
            
            obj.courier.undeliverable = function() {
                invoked = true;
            };
            
            courier.undeliverable(obj, sub);
            expect(invoked).to.be(true);
        });
    })
    
    describe(".unsubscribe", function() {
        it("should add a courier to an object if not present", function() {
            var obj = {};
            courier.unsubscribe(obj);
            expect(obj.courier).to.be.an("object");
        });

        it("should invoke an object courier's unsubscribe method", function() {
            var obj = {courier: {}},
                sub = function() {},
                invoked = false;
            
            obj.courier.unsubscribe = function() {
                invoked = true;
            };
            
            courier.unsubscribe(obj);
            expect(invoked).to.be(true);
        });
    })
    
    describe(".forward", function() {
        it("should add a courier to an object if not present", function() {
            var obj = {};
            courier.forward(obj, {});
            expect(obj.courier).to.be.an("object");
        });

        it("should invoke an object courier's forward method", function() {
            var obj = {courier: {}},
                sub = function() {},
                invoked = false;
            
            obj.courier.forward = function() {
                invoked = true;
            };
            
            courier.forward(obj, {});
            expect(invoked).to.be(true);
        });
    })
});
