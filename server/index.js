import { create } from "domain"
import { createServer } from "http"
import { Server } from "socket.io"
//create a socket.io server in port 3000
const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        //allow all origins in development, but only the origin of the app in production
        // to have all origins, set origin: "*"
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

//once there is a connection, listen for a message
io.on('connection', socket => {
    console.log('User ' + socket.id + ' connected') 
    socket.on('message', message => {
        console.log(data)
        io.emit('message', '${socket.id.substring(0,5): ${data}')
    })
})

httpServer.listen(3500, () => console.log('listening on port 3500'))