var firebase = require("firebase-admin");
var currentDate = new Date()
var smartMailBox = require("./smartMailbox.json");
var objectWeight = 0;
var desiredWeight = 50;
var threshHold = 500;
var mqtt = require('mqtt')



firebase.initializeApp({
    credential: firebase.credential.cert(smartMailBox),
    databaseURL: "https://smart-mailbox-b85b7.firebaseio.com/"


});
connectToMqtt();

//gets the data from the firebase raspberryPies path once


function getGrams(value) {
    value = objectWeight;
    var temp = value + (31/27);
    var temp = temp / (44/135);
    objectWeight = temp;
    console.log(temp)
    return temp;
}

function getValue(grams) {
    grams = objectWeight;
    var temp = (grams*44)/135;
    var temp = temp - (31/27);
    console.log(temp)
    return temp;
}

var options = {
    keepalive: 10,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
    },
    username: 'FlespiToken 2v2QwADAMIqKjO3q9NLBcs5ZB9wfJ1kzmadGAH5adlLm0CBXecogsj5RgqXPf5dp',
    password: '',
    rejectUnauthorized: false
}
    function connectToMqtt() {
        var clientId = 'mqttjs_'

        var host = 'wss://mqtt.flespi.io'

        var client = mqtt.connect(host, options)

        client.on('error', function (err) {
            console.log(err)
            client.end()
        })

        client.on('connect', function () {
            console.log('client connected:' + clientId)
        })

        client.subscribe('sensor/weight', {qos: 0})

        client.publish('sensor/weight', 'wss secure connection demo...!', {qos: 0, retain: false})
        client.on('message', function (topic, message, packet) {
            console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic)        });
        checkWithFirebase(message)

    function checkWithFirebase(message) {


            if (objectWeight < message) {
                objectWeight = message;
                console.log(objectWeight + " had the value of and " + message)

                var db = firebase.database();
                var ref = db.ref("history");
                var adaRef = firebase.database().ref("history/1572874339/weight");

                adaRef.once("value", function (snapshot) {
                    console.log(snapshot.val());
                    if (snapshot.val() > objectWeight) {
                        console.log("the weight was " + snapshot.val() + " and the desired weight was " + objectWeight)
                        getGrams();

                        adaRef.set({
                            weight: {
                                objectWeight

                            }

                        })
                    }
                    if (snapshot.val() < desiredWeight) {
                        console.log("the weight was " + snapshot.val() + " and the desired weight was " + desiredWeight)
                    }
                });

            } else {
                console.log("objectweight was less than message" + message + " the object was" + objectWeight)

            }

        }

        client.on('close', function () {
            console.log(clientId + ' disconnected')
        })
    }
