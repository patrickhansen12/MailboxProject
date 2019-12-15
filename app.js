const firebase = require("firebase-admin");
const smartMailBox = require("./smartMailbox.json");
const mqtt = require('mqtt')

let threshHold = 500;

firebase.initializeApp({
    credential: firebase.credential.cert(smartMailBox),
    databaseURL: "https://smart-mailbox-b85b7.firebaseio.com/"
});

const db = firebase.database();
const thresholdRef = db.ref("settings/weight");
const historyRef  =db.ref("history");

console.log("Subscribe to threshold value from firebase");
thresholdRef.on("value", function(snapshot) {
    let thresholdInGrams = snapshot.val();
    threshHold = getValue(thresholdInGrams);
    console.log("Threashold set at " + threshHold);
});

const clientId = 'reactjs';
const host = 'wss://mqtt.flespi.io';

const options = {
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

function getGrams(value) {
    let temp = value + (31/27);
    temp = temp / (44/135);
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

    let weightInGrams = getGrams(value);
    let data = {
        date: Date.now(),
        deviceid: 1,
        userid: "n88tvME1RffEYlvluaZBaH3fEwA2",
        weight: weightInGrams
    };

    historyRef.push().set(data);
}
