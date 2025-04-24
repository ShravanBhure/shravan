const socket = io('http://localhost:8000');

// Declare abc once at the top of your file
let loggedInUser = localStorage.getItem("loggedInUser");
let hasJoined = false;

// Ensure the DOM is fully loaded before sending socket events
window.addEventListener("DOMContentLoaded", () => {
    if (loggedInUser && !hasJoined) {
        // Emit a message to inform the server that a new user has joined
        socket.emit('new-user-joined', loggedInUser);
        hasJoined = true;  // Ensure this only happens once
    }
});



const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");

document.querySelector("#startBtn").addEventListener("click", () => {
  const audio = new Audio("ding-36029.mp3");
  audio.play(); // ✅ Allowed after interaction
});

const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
};

// Sending the message to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''; // Clear the input field
});

// Listen for incoming messages and append them to the chat
socket.on('user-joined', username => {
    console.log("Received user-joined event for:", username);
    append(`${username} joined the chat`, 'left');
});

socket.on('receive', data => {
    append(`${data.username}: ${data.message}`, 'left');
});

socket.on('left', username => {
    append(`${username} left the chat`, 'left');
});
