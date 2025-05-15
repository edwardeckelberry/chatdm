const ws = require('ws');
//create a websocket server in port 3000
const server = new ws.Server({ port: 3000 });

//once there is a connection, listen for a message
server.on('connection', socket => {
    socket.on('message', message => {
        //fun fact: if you want to see message in binary,
        //remove b and do console.log(message)
        const b = Buffer.from(message)
        console.log(b.toString())
        socket.send(`${message}`)
    })
})