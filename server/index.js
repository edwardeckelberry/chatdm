import express from 'express'
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

/*<button onclick="document.body.style.backgroundColor='#d87093'">pink</button>
    <button onclick="document.body.style.backgroundColor='#000000'">black</button> */
//to get the current directory and file name of the module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
const ADMIN = "Admin"

const app = express()


app.use(express.static(path.join(__dirname, "public")))

//we can pass in the server with express instead of http
const expressServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

const usersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

const io = new Server(expressServer, {
    //cross-origin resource sharing, will be different if sharing
    //the frontend app with a different domain, not just local
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    //upon connection, send connect user message
    socket.emit('message', buildMsg(ADMIN, `Welcome to the chat app!`))

    socket.on('enterRoom', ({ name, room }) => {
    //leave prev room
        const prevRoom = getUser(socket.id)?.room
        if (prevRoom) {
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room)

        //cant update prev room until after the state update
        // in activate user
        if (prevRoom) {
            io.to(prevRoom).emit('userList', {users: getUsersInRoom(prevRoom)})
        }

        //join new room
        socket.join(user.room)

        //to user who joined
        socket.emit('message', buildMsg(ADMIN, `You have joined the ${user.room} room`))

        //to everyone else in the room
        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))
    })
    //upon connection, send to all other users
    socket.broadcast.emit('message', 'User has joined')

    //listen for a message event
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    //when user disconnects, send event to all users
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', 'User ' + `${socket.id.substring(0, 5)}` + ' left')
    })

    //listen for activity event
    socket.on('activity', name => {
        socket.broadcast.emit('activity', name)
    })
})

function buildMsg(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

//User functions
function activateUser(id, name, room) {
    const user = { id, name, room }
    UsersState.setUsers([...usersState.users.filter(user => user.id !== id),
         user])
    return user
}

function userLeavesApp(id) {
    UsersState.setUsers(usersState.users.filter(user => user.id !== id))
}

function getUser(id) {
    return usersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
    return usersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}