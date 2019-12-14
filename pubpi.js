const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')
var firebase = require("firebase-admin");
var currentDate = new Date()
var smartMailBox = require("./smartMailbox.json");
var objectWeight = 6000;
var desiredWeight = 50;
var threshHold = 5000;

firebase.initializeApp({
    credential: firebase.credential.cert(smartMailBox),
    databaseURL: "https://smart-mailbox-b85b7.firebaseio.com/"
});

var state = 'closed'

client.on('connect', () => {
    client.subscribe('pubpi/open')
    client.subscribe('pubpi/close')

    // Inform controllers that garage is connected
    client.publish('pubpi/connected', 'true');
    getGrams();
    getValue();
    sendStateUpdate();
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
    //console.log('sending state %s', state)
    client.publish('pubpi/state', state)
    //checkDate();
    firebaseGetDataOnce();
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
    var adaRef = firebase.database().ref("history/1572874339/weight");

   // var usersRef = ref.child("1572874539");
    //console.log(adaRef)
     adaRef.once("value", function(snapshot) {
        console.log(snapshot.val());
         if(snapshot.val() > desiredWeight){
             console.log("the weight was " + snapshot.val() + " and the desired weight was " + desiredWeight)
         }
         if(snapshot.val() < desiredWeight){
             console.log("the weight was " + snapshot.val() + " and the desired weight was " + desiredWeight)
         }
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
})}

//overrides past pi1 and pi2 easy solutions datetime in name or check if pi1 or pi2 is already on firebase,
function firebaseCreateData(){
    var db = firebase.database();
    var ref =  db.ref("raspberryPies");
    var usersRef = ref.child("history");
   var test = "Pi1" + currentDate;
    usersRef.set({
        test: {
            joke: "Took you long enough sir",
            message: "A message from MailboxPi was received " + currentDate

        },
        Pi2: {
            joke: "This is not a joke but it is funny",
            message: "You received mail " + currentDate
        }

    })}

function checkDate() {
     var today =  currentDate.getDate();
        var yesterday = currentDate.getDate() - 1;
    console.log(today + " is the date of today")
        console.log(yesterday + " is the current date -1")

    if(today == yesterday || yesterday == today - 1 && threshHold > desiredWeight ) {
        console.log("seems like the value has been updated in the last 2 days")
    }
    let date_ob = new Date();

// current date
// adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    console.log(date);

// current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
    let year = date_ob.getFullYear();

// current hours
    let hours = date_ob.getHours();

// current minutes
    let minutes = date_ob.getMinutes();

// current seconds
    let seconds = date_ob.getSeconds();

    // prints date in DD-MM-Year format
    console.log(date + "-" + month + "-" + year);

// prints date in YYYY-MM-DD format
    console.log(year + "-" + month + "-" + date);

// prints date & time in YYYY-MM-DD HH:MM:SS format
    console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);


}
function getGrams(value) {
    value = 12;
    var temp = value + (31/27);
    var temp = temp / (44/135);
console.log(temp)
    return temp;
}

function getValue(grams) {
    grams = 100;
    var temp = (grams*44)/135;
    var temp = temp - (31/27);
console.log(temp)
    return temp;
}
