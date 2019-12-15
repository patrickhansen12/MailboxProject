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
//gets the data from the firebase raspberryPies path once
var db = firebase.database();
var ref = db.ref("history");
var adaRef = firebase.database().ref("history/1572874339/weight");

adaRef.once("value", function(snapshot) {
    console.log(snapshot.val());
    if(snapshot.val() > desiredWeight){
        console.log("the weight was " + snapshot.val() + " and the desired weight was " + desiredWeight)
    }
    if(snapshot.val() < desiredWeight){
        console.log("the weight was " + snapshot.val() + " and the desired weight was " + desiredWeight)
    }
});
var db = firebase.database();
var ref =  db.ref("raspberryPies");
//gets all the data from the history path on firebase
var usersRef = ref.child("history");
// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
    var result = ref.push();
        //console.log(result);
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
