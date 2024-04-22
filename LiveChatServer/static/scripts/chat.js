const textarea = document.getElementById('textarea');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');

const setupSockets = () => {
    const socket = io();

    socket.on('connect', () => {
        socket.emit('joinRoom', chatName, rcode);
    })

    socket.on('joinedRoom', (rCode) => {
        document.getElementById('username').innerHTML = chatName
        document.getElementById('rcode').innerHTML = rCode
        localStorage.setItem('livechat-rcode', rCode)
    })

    socket.on('updateClientText', (content) => {
        textarea.value = content;
    })
    
    socket.on('updateClientMembers', (members) => {
        document.getElementById('members').innerHTML = members.join(', ');
    })

    socket.on('notifyRoom', (message) => {
        document.getElementById('notification').innerHTML = message
    })

    socket.on('error', (message) => {
        document.getElementById('error').innerHTML = message       
    })

    textarea.addEventListener('input', () => {
        socket.emit('updateServerText', rcode, textarea.value)
    })
}

if (!chatName || !rcode) {
    window.location.href = '/';
} 
else{
    setupSockets();
}

