const mqtt = require('mqtt')
    const client = mqtt.connect('mqtt://broker.hivemq.com')
var startDate = "";
var fetcheddate = 'This is not working';
var endDate= "";
var getDate = new Date();
    var pubpiState = ''
    var connected = false

    client.on('connect', () => {
        client.subscribe('pubpi/connected')
        client.subscribe('pubpi/state')

    })

    client.on('message', (topic, message) => {
        switch (topic) {
            case 'pubpi/connected':
                return handlePubpiConnected(message)
            case 'pubpi/state':
                return handlePubpiState(message)
        }
        console.log('No handler for topic %s', topic)
    })

    function handlePubpiConnected (message) {

        console.log('pubpi connected status %s', message)
        connected = (message.toString() === 'true')

    }
function SetTime() {
    const hour = this.getDate.getHours();
    const minutes = this.getDate.getMinutes();
    let hourS = "";
    let minutesS = "";
    if (hour < 10) {
        hourS = '0' + hour;
    } else {
        hourS = hour + '';
    }
    if (minutes < 10) {
        minutesS = '0' + minutes;
    } else {
        minutesS = minutes + '';
    }
    const splitDate = this.getDate.toISOString().split('T');
    const formattedDate = splitDate[0] + 'T' + hourS + ':' + minutesS;

    this.startDate = formattedDate;
    console.log(startDate);
    console.log(splitDate)
    console.log(minutesS)
    console.log(hourS)
}

    function handlePubpiState (message) {
        pubpiState = message
        console.log('pubpi state update to %s', message)
    }
    function openGarageDoor () {
        // can only open door if we're connected to mqtt and door isn't already open
        if (connected && pubpiState !== 'open') {
            // Ask the door to open
            client.publish('pubpi/open', 'true')
        }
    }

    function closeGarageDoor () {
        // can only close door if we're connected to mqtt and door isn't already closed
        if (connected && pubpiState !== 'closed') {
            // Ask the door to close
            client.publish('pubpi/close', 'true')
        }
    }

// --- For Demo Purposes Only ----//

// simulate opening garage door
    setTimeout(() => {
        const hour = getDate.getHours();
        const minutes = getDate.getMinutes();
        let hourS = "";
        let minutesS = "";
        if (hour < 10) {
            hourS = '0' + hour;
        } else {
            hourS = hour + '';
        }
        if (minutes < 10) {
            minutesS = '0' + minutes;
        } else {
            minutesS = minutes + '';
        }
        const splitDate = getDate.toISOString().split('T');
        const formattedDate = splitDate[0] + 'T' + hourS + ':' + minutesS;

        startDate = formattedDate;
        console.log(startDate);
        console.log(splitDate)
            console.log(minutesS)
        console.log(hourS)
        console.log('open door')
        openGarageDoor()
    }, 5000)

// simulate closing garage door
    setTimeout(() => {
        console.log('close door')
        closeGarageDoor()
    }, 20000)

