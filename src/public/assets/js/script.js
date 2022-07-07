const socket = io();



let data = new URLSearchParams(window.location.search);
const username = document.getElementById('user').innerHTML;

const newMsg = (toSend) => {
    let a = {
        room: data.get("id"),
        name: username,
        message: toSend,
    }

    return a;
}

socket.emit('connected', {user: username, room: data.get('id') });

socket.on('userJoin', (user) => userJoin(user));
socket.on('userLeave', (user) => userLeave(user));

socket.on('video_error', (msg) => console.log(msg));

socket.on('test', (msg) => console.log(msg));

const msg = (send) => { socket.emit('msg', newMsg(send)) };

socket.on('msg', (data) => {
    if (data.name == username) newMsgFr(data.name, data.message, true);
    else newMsgFr(data.name, data.message, false);
});

socket.on('user_connected', (evt) => console.log(evt));

const input_msg = document.getElementById('input-msg');
let onInput = false;

document.addEventListener('keydown', (e) => {
    if (onInput && e.key == 'Enter') sendMsg();
})

input_msg.addEventListener('focus', () => {
    onInput = true;
});

input_msg.addEventListener('focusout', () => {
    onInput = false;
});

const sendMsg = () => {
    if (input_msg.value == '') return;
    msg(input_msg.value);
    input_msg.value = '';
}

const messageContainer = document.getElementById('messages');

const newMsgFr = (user, message, self) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('message');
    msgCont.classList.add('text-white');
    msgCont.classList.add('w-100');

    let userC = document.createElement('span');

    if (self) userC.classList.add('self');
    else userC.classList.add('username');

    userC.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = `: ${message}`;

    msgCont.appendChild(userC);
    msgCont.appendChild(msg);

    messageContainer.appendChild(msgCont);
}

const userJoin = (user) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let userC = document.createElement('span');
    userC.classList.add('join');
    userC.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = ' entro a la sala';

    msgCont.appendChild(userC);
    msgCont.appendChild(msg);

    messageContainer.appendChild(msgCont);
}

const userLeave = (user) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let userC = document.createElement('span');
    userC.classList.add('leave');
    userC.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = ' salio de la sala';

    msgCont.appendChild(userC);
    msgCont.appendChild(msg);

    messageContainer.appendChild(msgCont);
}

const player = document.getElementById('video_player');

if (data.get('video')) {
    player.src = `rooms/${data.get('id')}/${data.get('video')}.mp4`;
    player.currentTime = data.get('current');

    switch (data.get('status')) {

        case "playing":
            player.muted = true;
            player.autoplay = true;
            break;
        case "paused":
            player.pause();
            break;
    };
}

const sendUrl = (id, name) => {
    let vid = {
        name: name,
        url: `https://www.youtube.com/watch?v=${id}`
    };

    socket.emit('url', vid);
}

socket.on('video', (path) => {
    player.src = '';
    setTimeout(() => {
        
    player.src = path;
    player.play();
    }, 2000);
});

const key = 'AIzaSyBZzhwBIP2RnmNUE4omdKUDb5tnI_XXib0';
const client = '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';

const searchVideo = (query, callback) => {

    fetch (`https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=relevance&q=${query}&type=video&videoDefinition=any&videoEmbeddable=true&maxResults=10&key=${key}`, { 

    }).then(res => res.json())
        .then(resp => {
            return callback(resp);
        });
}

const addVideo = (title, img_Link, id, channel_name, channel_img) => {

    const container = document.getElementById('results');

    let newDiv = document.createElement('div');
    newDiv.classList.add('video');
    newDiv.classList.add('card');
    newDiv.classList.add('text-center');
    newDiv.classList.add('mt-2');

    let newImg = document.createElement('img');
    newImg.classList.add('card-img-top');
    newImg.src = img_Link;

    let newBody = document.createElement('div');
    newBody.classList.add('card-body');

    let newH5 = document.createElement('h5');
    newH5.classList.add('card-title');
    newH5.innerHTML = title;

    let newBtn = document.createElement('button');

    newBtn.classList.add('btn');
    newBtn.classList.add('btn-primary');

    newBtn.type = 'button';

    newBtn.onclick = () => {
        sendUrl(id, title);
    }

    newBtn.innerHTML = 'Reproducir';

    let newFooter = document.createElement('div');
    newFooter.classList.add('card-footer');

    let newF_img = document.createElement('img');
    newF_img.src = `${channel_img}`;
    newF_img.classList.add('rounded-circle');
    newF_img.classList.add('img-footer');

    
    let newP = document.createElement('p');
    newP.innerHTML = ` ${channel_name}`;
    
    newDiv.appendChild(newImg);
    newDiv.appendChild(newBody);
    newDiv.appendChild(newFooter);
    
    newBody.appendChild(newH5);
    newBody.appendChild(newBtn);
    
    newFooter.appendChild(newF_img);
    newFooter.appendChild(newP);
    

    container.appendChild(newDiv);
}

const search = () => {

    clearSearch();

    const input = document.getElementById('search-q');

    searchVideo(input.value, (resp) => {

        for (let i = 0; i < 10; i++) {
            if (!resp.items[i]) break;

            channel(resp.items[i].snippet.channelId, (ch) => {

                addVideo(resp.items[i].snippet.title, resp.items[i].snippet.thumbnails.high.url, resp.items[i].id.videoId, ch.items[0].snippet.title, ch.items[0].snippet.thumbnails.default.url);
            })

            
        }
    });

    let modal = new bootstrap.Modal(document.getElementById('modal')).show();
}

const clearSearch = () => {
    while (true) {
        let searchs = document.getElementsByClassName('video');

        if (!searchs[0]) break;
        else searchs[0].remove();
    }
}

const channel = (channel_id, callback) => {
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel_id}&key=${key}`, {

    }).then(res => res.json())
        .then(resp => callback(resp));
}

window.history.pushState(null, null, `${window.location.pathname}`);