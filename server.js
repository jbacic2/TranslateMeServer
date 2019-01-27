const express           = require('express');
const app               = express();
const server            = require('http').createServer(app);
//const io                = require('socket.io')(server);
const WebSocket = require('ws')
const wss = new WebSocket.Server({server: server})

app.use(express.json())


//Fake user for testing
var appUsers = [];


/**
 * Second test for sockets
 */
// var server = http.createServer((req, res) => {
    
// })  

const originIsAllowed = (origin) => {
    return true;
}

wss.on('connection', (ws) => {

    console.log("Connected!")
    ws.on('message', function incoming(message) {
        let data = JSON.parse(message)

        let currrentPerson;
        console.log(appUsers)
        for (let i =0; i<appUsers.length; i++) {
            if (appUsers[i].username == data.data.username)
                currentPerson = appUsers[i];
        }
    
        

        if (data.type == 'logon'){

            currentPerson.socketID = ws;
    
            currentPerson.longitude = data.data.longitude;
            currentPerson.latitude = data.data.latitude;
            currentPerson.role = data.data.role;

    
            console.log("logon" + currentPerson)

            lookForMatch(currentPerson);
            

        }//longon
        else if(data.type =="locationUpdate"){
            currentPerson.longitude = data.data.longitude;
            currentPerson.latitude = data.data.latitude;

            console.log("locationUPdate" + currentPerson)
            if (currentPerson.matchedWith != null) {
                mapUpdate(currentPerson);
            } else {
                lookForMatch(currentPerson);
            }
        }

        console.log('received: %s', message);
      });
    
})//on connect


//------------------------------------------------------


//express.static('/');
//app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.post("/register", function (req, res) {
    newUser = {
        username: req.body.username,
        name: req.body.name,
        role: 'OFFLINE',
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        socketID: null,
        matchedWith: null
    }

    appUsers.push(newUser);
    res.send(JSON.stringify({
        approved: true
    }))
})




server.listen(process.env.PORT || 8080); //************ */

//*********************************************** 
//********************************************* */
//********************************************* */
//********************************************* */

function lookForMatch(currentPerson) {

    console.log("lookForMatch")

    //check for match USER
    if (currentPerson.role == "USER") {

        console.log("user")
        var currentTranslators = [];

        //find list of tranlators
        for (let i = 0; i < appUsers.length; i++) {
            if (appUsers[i].role == "TRANSLATOR")
                currentTranslators.push(appUsers[i]);
        }

        //if there are multiple translators find the closest
        if (currentTranslators.length > 0) {
            var nearestTranslator = currentTranslators[0];

            for (translator in currentTranslators) {
                if (findDist(currentPerson.location, nearestTranslator.location) > findDist(currentPerson.location, translator.location))
                    nearestTranslator = translator;
            }

            match(currentPerson, nearestTranslator);

        } //if 
    }

    if (currentPerson.role == "TRANSLATOR") {
        console.log("translator")

        var currentUsers = [];

        //find list of users
        for (let i = 0; i < appUsers.length; i++) {
            if (appUsers[i].role == "USER")
                currentUsers.push(appUsers[i]);
        }


        if (currentUsers.length > 0) {
            var nearestUser = currentUsers[0];

            for (user in currentUsers) {
                if (findDist(currentPerson.location, nearestUser.location) > findDist(currentPerson.location, user.location))
                    nearestUser = user
            }

            match(nearestUser, currentPerson);

        } //if 
    }
} //lookForMatch

function findDist(person1, person2) {
    var earthRadius = 3958.75;
    var latDiff = Math.toRadians(person1.latitude - person2.latitude);
    var lngDiff = Math.toRadians(person1.longitude - person2.longitude);
    var a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(Math.toRadians(person2.latitude)) * Math.cos(Math.toRadians(person1.latitude)) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = earthRadius * c;

    var meterConversion = 1609;

    return distance * meterConversion;
}

function match(aUser, aTranslator) {

    console.log("match")
    aUser.matchedWith = aTranslator.username;
    aTranslator.matchedWith = aUser.username;

    //calculate path with api
    https.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${aTranslator.longitude},${aTranslator.latitude};${aUser.longitude},${aUser.latitude}.json?access_token=${mapKey}&overview=full`, (resp) => {
        let data = ''

        resp.on('data', (chunk) => {
            data += chunk
        })

        resp.on('end', () => {
            let locDataObj = JSON.parse(data);
            

            var message = {
                path:locDataObj.routes[0].geometry,
                user:  aTranslator 
            }
            aUser.socketID.send(JSON.stringify(message));

            message["user"]= aUser
            aTranslator.socketID.send(JSON.stringify(message));

        })
    }) //https get request
}

function mapUpdate(currentPerson) {
    //will send user data to other person
    var locData = JSON.stringify(currentPerson);
    currentPerson.matchedWith.socketID.send(locData);

}