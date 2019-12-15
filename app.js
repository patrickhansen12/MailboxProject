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

var db = firebase.database();
let thresholdRef = db.ref("settings/weight");
var adaRef = firebase.database().ref("history/1572874339/weight");

console.log("Subscribe to threashold value from firebase");
thresholdRef.on("value", function(snapshot) {
    let thresholdInGrams = snapshot.val();
    threshHold = getValue(thresholdInGrams);
    console.log("Threashold set at " + threshHold);
});

var clientId = 'reactjs';
var host = 'wss://mqtt.flespi.io';

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
};

let client = mqtt.connect(host, options);

client.on('error', function (err) {
    console.log(err);
    client.end();
});

client.on('connect', function () {
    console.log('client connected:' + clientId)
});

console.log("Subscribe to MQTT sensor/weight");
client.subscribe('sensor/weight', {qos: 0});

console.log("Define MQTT Message behavior");
client.on('message', function (topic, message, packet) {
    console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic);
    checkWithFirebase(message);
});

//gets the data from the firebase raspberryPies path once


function getGrams(value) {
    value = objectWeight;
    let temp = value + (31/27);
    temp = temp / (44/135);
    objectWeight = temp;
    console.log("converted value " + value + " into grams: "+ temp);
    return temp;
}

function getValue(grams) {
    let temp = (grams*44)/135;
    temp = temp - (31/27);
    console.log("converted grams: " + grams + " into value: " + temp);
    return temp;
}

function checkWithFirebase(message) {
    if(message == "dead") {
        console.error("Exception from Weight");
        return;
    }

    if(message == "shutdown") {
        console.log("Weight shut down gracefully");
        return;
    }

    let value = parseInt(message);
    if(value > threshHold) {
        console.log("Send notification");
        client.publish("notification/mail", "true")
    } else {
        console.log("Dont send notification");
        client.publish("notification/mail", "false");
    }

    // TODO: Add to Firebase History database
}
