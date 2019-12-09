var firebase = require("firebase-admin");
var currentDate = new Date()
var smartMailBox = require("./smartMailbox.json");

firebase.initializeApp({
    credential: firebase.credential.cert(smartMailBox),
    databaseURL: "https://smart-mailbox-b85b7.firebaseio.com/"
});
//gets the data from the firebase raspberryPies path once
var db = firebase.database();
var ref = db.ref("history");
ref.once("value", function(snapshot) {
    console.log(snapshot.val());
});
var db = firebase.database();
var ref =  db.ref("raspberryPies");
//gets all the data from the history path on firebase
var usersRef = ref.child("history   ");
// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//overrides past pi1 and pi2 easy solutions datetime in name or check if pi1 or pi2 is already on firebase,
usersRef.set({
    Pi1: {
        joke: "Took you long enough sir",
        message: "A message from MailboxPi was received " + currentDate

    },
    Pi2: {
        joke: "This is not a joke but it is funny",
        message: "You received mail " + currentDate
    }

});