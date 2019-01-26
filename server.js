const sqlite3 = require('sqlite3').verbose();
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let db = new sqlite3.Database("./db/userTable", (err) => {
    if(err){//error opening 
        console.log(err.message)
    }


});


app.post("/register", function(req,res){
    //
    console.log("username: "+req.body.username);

})

app.post("/login", function(req,res){
    //check to req.body.u
    console.log("username: "+req.body.role);



})


io.on('connection', () => { /* … */ });
server.listen(3000);


//closing data base
db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });