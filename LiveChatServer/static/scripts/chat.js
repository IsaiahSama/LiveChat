const textareaDiv = document.getElementById('textareas');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');

let socket = null

const setupSockets = () => {
    socket = io();

    socket.on('connect', () => {
        socket.emit('joinRoom', chatName, rcode);
    })

    socket.on('joinedRoom', (data) => {
        document.getElementById('username').innerHTML = chatName
        document.getElementById('rcode').innerHTML = data.rcode
        localStorage.setItem('livechat-rcode', data.rcode)
        prepareRooms(data.members)
    })

    socket.on('updateClientText', (data) => {
        targetTextarea = document.getElementById(data.username)
        if (!targetTextarea) {
            return
        }
        targetTextarea.value = data.content
    })
    
    socket.on('updateClientMembers', (members) => {
        document.getElementById('members').innerHTML = members.join(', ');
    })

    socket.on('memberJoined', (member) => {
        if (member == chatName) return;
        prepareRoom(member);    
    })

    socket.on('memberLeft', (member) => {
        document.getElementById(member + 'Div').remove()    
    })

    socket.on('notifyRoom', (message) => {
        document.getElementById('notification').innerHTML = message
    })

    socket.on('error', (message) => {
        document.getElementById('error').innerHTML = message       
    })
}

const prepareRooms = (members) => {
    for (let member of members) {
        prepareRoom(member)
    }
}

const createTextContainer = () => {
    const textContainer = document.createElement('div');
    textContainer.className = "flex flex-direction-column align-items-left ceell";

    textContainer.style.borderColor = getRandomColor();

    return textContainer;
}

const createTextarea = (username) => {
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea')
    textarea.rows = 10
    textarea.cols = 30

    textarea.id = username

    textarea.addEventListener('input', () => {
        socket.emit('updateServerText', rcode, textarea.id, textarea.value)
    })

    return textarea;
}

const createSpan = (username, color) => {
    const span = document.createElement('span');
    span.innerHTML = `${username}'s Chat `;
    span.style.color = color;

    return span;
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const prepareRoom = (username) => {
    const textContainer = createTextContainer();
    textContainer.id = username + "Div";

    const span = createSpan(username, getRandomColor());

    const textarea = createTextarea(username);

    textContainer.appendChild(span);
    textContainer.appendChild(textarea);

    textareaDiv.appendChild(textContainer);
}

if (!chatName || !rcode) {
    window.location.href = '/';
} 
else{
    setupSockets();
}

