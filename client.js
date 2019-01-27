let socket = io('http://' + window.document.location.host);

console.log(socket);

console.log("hi im here")

socket.on('connection', () => {
    console.log("hi");

    let newUser = {
        username: 'omar',
        name: 'hi',
        role: 'OFFLINE',
        longitude: 12,
        latitude: 14,
        socketID: null,
        matchedWith: null
    }

    socket.emit('logon', newUser);

})

