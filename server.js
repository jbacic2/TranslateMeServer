const express           = require('express');
const app               = express();
const server            = require('http').createServer(app);
//const io                = require('socket.io')(server);
const WebSocket = require('ws')
const wss = new WebSocket.Server({server: server})

app.use(express.json())


//Fake user for testing
var appUsers = [newUser = {
    username: 'omar',
    name: 'hi',
    role: 'OFFLINE',
    longitude: 12,
    latitude: 14,
    socketID: null,
    matchedWith: null
}];


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
    //const connection = req.accept('echo-protocol', req.origin);

    //console.log((new Date()) + "Accepted");

    //get id

    /*connection.on('*', (message) => {
        console.log("Received data" + message);

        let data=message.data

        if (message.type == 'logon'){

            let currrentPerson;

            for (person of appUsers) {
                if (person.username == data.username)
                    currentPerson = person;
            }
    
            currentPerson.socketID = ws;
    
            currentPerson.longitude = data.longitude;
            currentPerson.latitude = data.latitude;
            currentPerson.role = data.role;
    
            console.log(currentPerson)

        }//longon
        else if(message.type =="locationUpdate"){
            currentPerson.longitude = data.longitude;
            currentPerson.latitude = data.latitude;

            if (currentPerson.matched == true) {
                mapUpdate(currentPerson);
            } else {
                lookForMatch(currentPerson);
            }
        }

    })*/
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

// //sockets    
// io.on('connection', (socket) => {
//     socket.emit("logon",
//         newUser = {
//             username: 'omar',
//             name: 'hi',
//             role: 'OFFLINE',
//             longitude: 12,
//             latitude: 14,
//             socketID: null,
//             matchedWith: null
//         })

//     let thisSocketID = socket.id;
//     let currentPerson;

//     //currentPerson.socketID = socket.id;
//     socket.on("logon", (data) => {
//         let temp = data

//         console.log(temp);

//         for (person of appUsers) {
//             if (person.username == temp.username)
//                 currentPerson = person;
//         }

//         currentPerson.socketID = thisSocketID;

//         currentPerson.longitude = temp.longitude;
//         currentPerson.latitude = temp.latitude;
//         currentPerson.role = temp.role;

//         console.log(currentPerson)
//     })

    //let currentPerson;

    //console.log("This is the socket", socket)

    //find user
    // for (person of appUsers){
    //     if (person.username == req.body.username)
    //         currentPerson = person;
    // }

    // currentPerson.longitude = req.body.longitude;
    // currentPerson.latitude = req.body.latitude;
    // currentPerson.role = req.body.role;


    //lookForMatch(currentPerson);

    /*app.post("/login", function(req,res){
    

        send.res("");
    });*/


    //updates location
//     socket.on("locationUpdate", function (from, data) {
//         currentPerson.longitude = req.body.longitude;
//         currentPerson.latitude = req.body.latitude;

//         if (currentPerson.matched == true) {
//             mapUpdate(currentPerson);
//         } else {
//             lookForMatch(currentPerson);
//         }

//     });

// }); //io.on connect




server.listen(process.env.PORT || 8080); //************ */

//*********************************************** 
//********************************************* */
//********************************************* */
//********************************************* */

function lookForMatch(currentPerson) {

    //check for match USER
    if (currentPerson.role == USER) {
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

    if (currentPerson.role == TRANSLATOR) {
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