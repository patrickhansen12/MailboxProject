const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')
var firebase = require("firebase-admin");
var currentDate = new Date()
var smartMailBox = require("./smartMailbox.json");


firebase.initializeApp({
    credential: firebase.credential.cert(smartMailBox),
    databaseURL: "https://smart-mailbox-b85b7.firebaseio.com/"
});

var state = 'closed'

client.on('connect', () => {
    client.subscribe('pubpi/open')
    client.subscribe('pubpi/close')

    // Inform controllers that garage is connected
    client.publish('pubpi/connected', 'true')
    sendStateUpdate()
})

client.on('message', (topic, message) => {
    console.log('received message %s %s', topic, message)
    switch (topic) {
        case 'pubpi/open':
            return handleOpenRequest(message)
        case 'pubpi/close':
            return handleCloseRequest(message)
    }
})

function sendStateUpdate () {
    console.log('sending state %s', state)
    client.publish('pubpi/state', state)
    //firebaseGetDataOnce();
    //firebaseGetData();
    //firebaseCreateData();
}

function handleOpenRequest (message) {
    if (state !== 'open' && state !== 'opening') {
        console.log('opening garage door')
        state = 'opening'
        sendStateUpdate()

        // simulate door open after 5 seconds (would be listening to hardware)
        setTimeout(() => {
            state = 'open'
            sendStateUpdate()
        }, 5000)
    }
}

function handleCloseRequest (message) {
    if (state !== 'closed' && state !== 'closing') {
        state = 'closing'
        sendStateUpdate()

        // simulate door closed after 5 seconds (would be listening to hardware)
        setTimeout(() => {
            state = 'closed'
            sendStateUpdate()
        }, 5000)
    }
}

/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit (options, err) {
    if (err) {
        console.log(err.stack)
    }

    if (options.cleanup) {
        client.publish('pubpi/connected', 'false')

    }

    if (options.exit) {
        process.exit()
    }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
    cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
    exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
    exit: true
}))
//gets the data from the firebase raspberryPies path once
function firebaseGetDataOnce() {
    var db = firebase.database();
    var ref = db.ref("history");
    ref.once("value", function(snapshot) {
        console.log(snapshot.val());
    });
}

function firebaseGetData(){
var db = firebase.database();
var ref =  db.ref("raspberryPies");
//gets all the data from the history path on firebase
var usersRef = ref.child("history");
// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
})};

//overrides past pi1 and pi2 easy solutions datetime in name or check if pi1 or pi2 is already on firebase,
function firebaseCreateData(){
    var db = firebase.database();
    var ref =  db.ref("raspberryPies");
    var usersRef = ref.child("history");
    usersRef.set({
    Pi1: {
        joke: "Took you long enough sir",
        message: "A message from MailboxPi was received " + currentDate

    },
    Pi2: {
        joke: "This is not a joke but it is funny",
        message: "You received mail " + currentDate
    }

})};