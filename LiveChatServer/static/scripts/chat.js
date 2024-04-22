const textarea = document.getElementById('textarea');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');

const setupSockets = () => {
    const socket = io();

    socket.on('connect', () => {
        socket.emit('joinRoom', chatName, rcode);
        console.log('connected');
    })

    socket.on('joinedRoom', (data) => {
        document.getElementById('rcode').innerHTML = data.rcode
        localStorage.setItem('livechat-rcode', data.rcode)
    })

    socket.on('updateClientText', (data) => {
        textarea.value = data.content;
    })
    
    socket.on('updateClientMembers', (data) => {
        document.getElementById('members').innerHTML = data.members.join(', ');
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

