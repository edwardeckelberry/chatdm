import express from 'express'
import { Server } from "socket.io"

const PORT = process.env.PORT || 3500

const app = express()

//we can pass in the server with express instead of http
const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

const io = new Server(expressServer, {
    //cross-origin resource sharing, will be different if sharing
    //the frontend app with a different domain, not just local
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })
})
