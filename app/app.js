const socket = io('ws://localhost:3000');

//e = event
function sendMessage(e){
    //so the form doesn't refresh the page
    e.preventDefault()
    const input = document.querySelector('input')
    if (input.value){
        //send the message to the server
        socket.send(input.value)
        input.value = ""
    }
    //go back to the input so the user can type again
    input.focus()
}

//once the connection is open, send a message
document.querySelector('form').addEventListener('submit', sendMessage)

//listen for messages from the server
socket.on("message", (data) => {
    //create a new list item
    const li = document.createElement('li')
    //retrive the message from the server
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})