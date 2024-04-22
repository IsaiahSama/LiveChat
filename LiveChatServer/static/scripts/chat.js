const textarea = document.getElementById('textarea');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');

const setupSockets = () => {
    const socket = io();

    socket.on('connect', () => {
        socket.emit('joinRoom', chatName, rcode);
        console.log('connected');
    })

    socket.on('joinedRoom', (rCode) => {
        document.getElementById('rcode').innerHTML = rCode
        localStorage.setItem('livechat-rcode', rCode)
    })

    socket.on('updateClientText', (content) => {
        textarea.value = content;
    })
    
    socket.on('updateClientMembers', (members) => {
        document.getElementById('members').innerHTML = members.join(', ');
    })

    textarea.addEventListener('onchange', () => {
        socket.emit('updateServerText', textarea.value)
    })
}

if (!chatName || !rcode) {
    window.location.href = '/';
} 
else{
    setupSockets();
}

