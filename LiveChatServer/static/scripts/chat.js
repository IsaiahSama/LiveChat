const textarea = document.getElementById('textarea');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');

const setupSockets = () => {
    const socket = io();

    socket.on('connect', () => {
        console.log('connected');
    })
}

if (!chatName || !rcode) {
    window.location.href = '/';
} 
else{
    setupSockets();
}

