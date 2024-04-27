const textareaDiv = document.getElementById('textareas');

const chatName = localStorage.getItem('livechat-name');
const rcode = localStorage.getItem('livechat-rcode');
const color = localStorage.getItem('livechat-color');

let socket = null

const setupSockets = () => {
    socket = io();

    socket.on('connect', () => {
        socket.emit('joinRoom', chatName, rcode, color);
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
        document.getElementById('members').innerHTML = Object.keys(members).join(', ');
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
        prepareRoom(member[0], member[1])
    }
}

const createTextContainer = () => {
    const textContainer = document.createElement('div');
    textContainer.className = "is-flex is-flex-direction-column cell";

    return textContainer;
}

const createTextarea = (username, color) => {
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea')
    textarea.rows = 10
    textarea.cols = 30

    textarea.id = username

    textarea.style.borderColor = color

    textarea.addEventListener('input', () => {
        socket.emit('updateServerText', rcode, textarea.id, textarea.value)
    })

    return textarea;
}

const createHeader = (username, color) => {
    const divContainer = document.createElement('div');
    divContainer.className = "is-flex is-justify-content-space-between is-fullwidth";

    const span = document.createElement('span');
    span.innerHTML = `${username}'s Chat `;
    span.style.color = color;

    const button = document.createElement('button');
    button.innerText = "CLEAR";

    button.className = 'button'
    button.style.backgroundColor = color

    button.addEventListener('click', () => {
        document.getElementById(username).value = ""
    })

    divContainer.appendChild(span);
    divContainer.appendChild(button);

    return divContainer;
}

const prepareRoom = (username, color) => {
    const textContainer = createTextContainer();
    textContainer.id = username + "Div";

    const header = createHeader(username, color);

    const textarea = createTextarea(username, color);

    textContainer.appendChild(header);
    textContainer.appendChild(textarea);

    textareaDiv.appendChild(textContainer);
}

if (!chatName || !rcode) {
    window.location.href = '/';
} 
else{
    setupSockets();
}

