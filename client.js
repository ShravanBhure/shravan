const socket = io('http://localhost:8000');

// Declare abc once at the top of your file
let loggedInUser= localStorage.getItem("currentUser");
let hasJoined = false;


// Handle if user is kicked (logged in from another tab)
socket.on('kicked', (message) => {
    alert(message);
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  });


socket.on('login-failed', (message) => {
    alert(message);
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
});

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById("messageContainer");
const userListContainer = document.getElementById('userList'); 

let onlineUsers = [];
socket.on("connect", () => {
    if (loggedInUser && !hasJoined) {
      socket.emit("new-user-joined", loggedInUser);
      hasJoined = true;
    }
  });


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

const updateUserList = () => {
    userListContainer.innerHTML = ''; // Clear list first
    onlineUsers.forEach(loggedInUser => {
        const userElement = document.createElement('div');
        userElement.classList.add('user-item');

        userElement.innerHTML = `
            <span class="online-dot"></span>
            <span class="username">${loggedInUser}</span>
        `;

        userListContainer.append(userElement);
    });
};


// Sending the message to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message === "") return;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''; // Clear the input field
});

// Listen for incoming messages and append them to the chat
//const username= prompt("Enter your name to join");
socket.on('new-user-joined', (user) => {
    console.log("User joined:", user);
    append(`${user} joined the chat`, 'right');
    if (!onlineUsers.includes(user)) {
        onlineUsers.push(user);
        updateUserList();
    }
});

socket.on('receive', data => {
    append(`${data.loggedInUser}: ${data.message}`, 'left');
});

socket.on('left',  loggedInUser=> {
    append(`${loggedInUser} left the chat`, 'left');
    onlineUsers = onlineUsers.filter(user => user !== loggedInUser);
    updateUserList();
});

socket.on('update-user-list', (users) => {
    onlineUsers = users;
    updateUserList();
});
 
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser"); // remove login
    window.location.href = "Login.html";    // go back to login page
  });

  const forgotPasswordLink = document.querySelector('.remember-forget a');
const modal = document.getElementById('forgotPasswordModal');
const closeBtn = document.querySelector('.close');
const sendResetLinkBtn = document.getElementById('sendResetLink');
const forgotEmailInput = document.getElementById('forgotEmail');

// Open the modal when clicking "Forgot Password"
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
});

// Close the modal when clicking X
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal if user clicks outside the modal
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// Handle send reset link button
sendResetLinkBtn.addEventListener('click', () => {
    const email = forgotEmailInput.value.trim();
    if (email) {
        alert(`Reset instructions will be sent to: ${email}`);
        modal.style.display = 'none';
        forgotEmailInput.value = '';
    } else {
        alert('Please enter a valid email address.');
    }
});