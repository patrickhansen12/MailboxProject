mqtt.connect([url], options)

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtts://mqtt.flespi.io:8883', {
    username: 'FlespiToken 2v2QwADAMIqKjO3q9NLBcs5ZB9wfJ1kzmadGAH5adlLm0CBXecogsj5RgqXPf5dp'
});

mqtt.Client.publish(topic, message, [options], [callback]);
