const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var appUsers =[];

app.get('/', (req, res) => res.send('hello'))

app.post("/register", function(req,res){
    newUser = {
        username: req.body.username,
        name: req.body.name,
        role: 'OFFLINE',
        location: req.body.location,
        socketID: null,
        matchedWith: null
    }
  
   appUsers.push(newUser);
})

app.post("/login", function(req,res){
    
    let currentPerson;

    //find user
    for (person of appUsers){
        if (person.username == req.body.username)
            currentPerson = person;
    }

    currentPerson.location = req.body.location;
    currentPerson.role = req.body.role;

    //sockets    
    io.on('connection', () => { 
        
        currentPerson.socketID = socket.id;

        lookForMatch(currentPerson);

        //updates location
        socket.on("locationUpdate", function(from, data){
            currentPerson.location = data.location;

            if (currentPerson.matched == true){
            mapUpdate(currentPerson);
           }
            else{
                lookForMatch(currentPerson);
            }

        });
    
    });//io.on connect
});


server.listen(443);//************ */


//closing data base
/*db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });*/

  //*********************************************** 
  //********************************************* */
  //********************************************* */
  //********************************************* */

  function lookForMatch(currentPerson){

    //check for match USER
    if (currentPerson.role == USER){
        var currentTranslators = [];

        //find list of tranlators
        for (let i = 0; i<appUsers.length; i++){
            if (appUsers[i].role == "TRANSLATOR")
                currentTranslators.push(appUsers[i]);
        }

        //if there are multiple translators find the closest
        if (currentTranslators.length>0){
            var nearestTranslator = currentTranslators[0]; 

            for (translator in currentTranslators){
                if (findDist(currentPerson.location, nearestTranslator.location)> findDist(currentPerson.location, translator.location))
                    nearestTranslator = translator;
            }

            match(currentPerson, nearestTranslator);

        }//if 
    }

    if (currentPerson.role == TRANSLATOR){
        var currentUsers = [];
        
         //find list of users
         for (let i = 0; i<appUsers.length; i++){
            if (appUsers[i].role == "USER")
                currentUsers.push(appUsers[i]);
        }


        if (currentUsers.length>0){
            var nearestUser = currentUsers[0]; 

            for (user in currentUsers){
                if (findDist(currentPerson.location, nearestUser.location)> findDist(currentPerson.location, user.location))
                    nearestUser = user
            }

            match(nearestUser, currentPerson);

        }//if 
    }
  }//lookForMatch

  function findDist(location1, location2){
    var earthRadius = 3958.75;
    var latDiff = Math.toRadians(lat_b-lat_a);
    var lngDiff = Math.toRadians(lng_b-lng_a);
    var a = Math.sin(latDiff /2) * Math.sin(latDiff /2) + Math.cos(Math.toRadians(lat_a)) * Math.cos(Math.toRadians(lat_b)) * Math.sin(lngDiff /2) * Math.sin(lngDiff /2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distance = earthRadius * c;

    var meterConversion = 1609;

    return distance * meterConversion;
  }

  function match(aUser, aTranslator){
      aUser.matchedWith = aTranslator.username;
      aTranslator.matchedWith =aUser.username;

      //calculate path

      var locTranslator = JSON.stringify(aTranslator.location);
      var locUser = JSON.stringify(aUser.location);
      io.to(`${aUser.socketID}`).emit('foundMatch', locTranslator);
      io.to(`${aTranslator.socketID}`).emit('foundMatch', locUser);
  }

  function mapUpdate(currentPerson){
    //will send user data to other person
    var locData = currentPerson.matchedWith.location;
    io.to(`${currentPerson.matchedWith.socketID}`).emit('foundMatch', locData);

  }