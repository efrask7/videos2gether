import { userJoin, addUserTable, removeUserTable, addVideo, msgAdmin, userLeaveAdmin, newMsgFr, userLeave, nowPlaying, newStatus } from '/assets/js/roomMsg.js';
import { pause, resume, previous, next } from '/assets/js/player.js';
import { search, sendMsg } from '/assets/js/script.js';

const username = document.getElementById('user').innerHTML.trim();
const player = document.getElementById('video_player');
let data = new URLSearchParams(window.location.search);

const socket = io(); //DE ESTA FORMA SE CONECTA AL SERVIDOR

let imAdmin = false;

socket.on('newTime', time => player.currentTime = time); //EL SERVIDOR MANDA ESTE EVENTO CUANDO ALGUIEN ADELANTA O ATRASA EL VIEDO
//PARA CAMBIARLO EN CADA USUARIO

socket.on('user_connected', data => { /*CUANDO SE CONECTA UN USUARIO MANDA AL
SERVIDOR LA POSICION DEL REPRODUCTOR ACTUAL PARA QUE ESE USUARIO ENTRE EN LA PARTE
DONDE TODOS ESTAN VIENDO*/
    if (data.s_id == socket.id) {
        socket.emit('getDuration'); //SI EL USUARIO CONECTADO ES UNO MISMO, PIDE LA DURACION DEL VIDEO ACTUAL
        return;
    }

    socket.emit('currentTime', player.currentTime);
});

socket.on('durationV', time => { //EL SERVIDOR EMITE LA DURACION DEL VIDEO PARA PONERLO EN EL REPRODUCTOR
    player.currentTime = time
    //playerAud.currentTime = time;
});

socket.on('video', async (data) => { //CUANDO SE CAMBIA EL VIDEO LO PONE EN EL REPRODUCTOR
    const title = document.getElementById('title');

    player.src = `${await data.url}`;
    //playerAud.src = `${await data.url}.mp3`;
    
    player.play();
    //playerAud.play();
    
    nowPlaying(data.name);

    title.innerHTML = data.name;
});

//EVENTOS DEL SERVIDOR PARA CUANDO ALGUIEN PAUSA, REPRODUCE, etc EL VIDEO
socket.on('paused', e => {
    player.pause();
    //playerAud.pause();
    newStatus(e, 'pauso');
});

socket.on('resumed', e => {
    player.play();
    //playerAud.play();
    newStatus(e, 'reanudo');
});

//EVENTOS DEL SERVIDOR

socket.on('disconnect', () => {
    new bootstrap.Toast(document.getElementById('liveToast')).show();
    
    setTimeout(() => {
        window.location = '/room';
    }, 3000);

}); //CUANDO SE DESCONECTA MUESTRA UN MENSAJE Y RECARGA LA PAGINA A LOS 3s

socket.emit('connected', {user: username, room: data.get('id') }); //CUANDO SE CONECTA MANDA LA INFORMACION AL SERVIDOR

socket.on('ping', newU => {
    if (newU == socket.id) return;
    socket.emit('pong', ({ user: username, socketId: socket.id }));
}); //EL SERVIDOR ENVIA UN PING PARA SABER QUIENES ESTAN CONECTADOS AL MOMENTO DE QUE
//ENTRA UN NUEVO USUARIO PARA QUE PUEDA VER QUIENES ESTAN CONECTADOS

//USUARIOS

//CUANDO SE CONECTA UN USUARIO MUESTRA EL MENSAJE EN EL CHAT
socket.on('userJoin', data => {
    userJoin(data.user);
    addUserTable(data.user);

    let online = document.getElementById('usersOnline');
    let onlineM = document.getElementById('usersOnlineMobile');

    online.innerHTML = Number(online.innerHTML)+1; 
    onlineM.innerHTML = Number(onlineM.innerHTML)+1;
});

//EL SERVIDOR ENVIA ESTE EVENTO A LOS 3s DE ENTRAR PARA AGREGAR LOS USUARIOS QUE ESTAN CONECTADOS
socket.on('addUsers', data => {
    console.log(data)
    console.log(data[0][2])
    for (let i in data[0]) {
        if (data[0][i] == username) continue;
        addUserTable(data[0][i]);
    }
});

//EL SERVIDOR ENVIA ESTE EVENTO PARA SABER SI UNO ES ADMIN DE LA SALA PARA ASI MOSTRAR LAS ACCIONES DE ADMIN
//(banear, expulsar, transferir admin);
socket.on('admin', boolean => {
    imAdmin = boolean;
    console.log('hola', boolean)
});

//EL SERVIDOR MANDA UN ERROR CUANDO NO SE PUDO REPRODUCIR UN VIDEO :(
socket.on('video_error', (msg) => new bootstrap.Toast(document.getElementById('errorServer')).show());


//CUANDO SE DESCONECTA UN USUARIO
socket.on('userLeave', (user) => {
    userLeave(user);
    removeUserTable(user);

    let online = document.getElementById('usersOnline');
    let onlineM = document.getElementById('usersOnlineMobile');

    online.innerHTML = Number(online.innerHTML)-1; 
    onlineM.innerHTML = Number(onlineM.innerHTML)-1;
});

//ENVIANDO MENSAJES

const newMsg = (toSend) => { //CREA UN OBJETO PARA MANDAR LA INFORMACION DEL MENSAJE
    let info = {
        room: data.get("id"),
        name: username,
        message: toSend,
    }

    return info;
}

const msg = (send) => { socket.emit('msg', newMsg(send)) }; //ENVIA EL MENSAJE AL SERIVODR Y LO ENVIA DE VUELTA A LOS USUARIOS

socket.on('msg', (data) => { //RECIBE EL MENSAJE DEL SERVIDOR Y LO MUESTRA
    if (data.name == username) newMsgFr(data.name, data.message, true);
    else newMsgFr(data.name, data.message, false);
});




//FUNCIONES

const kickUser = user => { //KICKEAR UN USUARIO
    socket.emit('kick', { id: socket.id, user: user });
};

const banUser = user => { //BANEAR UN USUARIO
    socket.emit('ban', { id: socket.id, user: user });
};

const transferAdmin = user => { //DARLE ADMIN A UN USUARIO
    socket.emit('newAdmin', { id: socket.id, user: user });
}

//HISTORIAL

//PARA VER EL HISTORIAL EL CLIENTE MANDA UN EVENTO PARA RECIBIR EL HISTORIAL
const viewHistory = () => {
    socket.emit('getHistory');

    while (true) {
        let history_vid = document.getElementsByClassName('table-video');

        if (!history_vid[0]) break;
        history_vid[0].remove();
    }
}

//RECIBE EL HISTORIAL PARA MOSTRARLO EN EL CLIENTE
socket.on('history', data => {
    const modal = new bootstrap.Modal(document.getElementById('history'));

    const body = document.getElementById('history-body');

    if (!data) return new bootstrap.Toast(document.getElementById('noHistory')).show();

    for (let i in data) {
        let newTr = document.createElement('tr');
        newTr.classList.add('table-video');

        let newTh = document.createElement('th');
        newTh.scope = 'row';

        newTh.textContent = Number(i)+1;

        let newTd = document.createElement('td');
        newTd.textContent = data[i];

        newTr.appendChild(newTh);
        newTr.appendChild(newTd);

        body.appendChild(newTr);
    }

    modal.show();
});


//MENSAJES EN EL CHAT

socket.on('kicked', data => { //CUANDO UN USUARIO ES EXPULSADO LA FUNCION VERIFICA
    if (data.id == socket.id) { //SI UNO ES EXPULSADO Y TE REDIRECCIONA AL INICIO
        window.location = '/room?exit=1&kicked=1';
    }
    userLeaveAdmin(data.username, 'kicked', 'expulsado'); //MUESTRA EL MENSAJE EN EL CHAT
});
//lo mismo con los demas eventos
socket.on('banned', data => {
    if (data.id == socket.id) {
        window.location = '/room?exit=1&banned=1';
    }
    userLeaveAdmin(data.username, 'banned', 'baneado');
});

socket.on('newAdmin', data => {
    if (data.id == socket.id) new bootstrap.Toast(document.getElementById('youAreAdmin')).show();
    msgAdmin(data.username);
});

window.onload = () => {
    document.getElementById('btn-search').onclick = () => search();
    document.getElementById('btnHistory').onclick = () => viewHistory();
    document.getElementById('btnHistory2').onclick = () => viewHistory();
    document.getElementById('btn-resume').onclick = () => resume();
    document.getElementById('btn-pause').onclick = () => pause();
    document.getElementById('btn-previous').onclick = () => previous();
    document.getElementById('btn-next').onclick = () => next();
    document.getElementById('btn-pip').onclick = () => player.requestPictureInPicture();
    document.getElementById('btn-fs').onclick = () => player.requestFullscreen();

    document.getElementById('btn-send_1').onclick = () => sendMsg(1);
    document.getElementById('btn-send_2').onclick = () => sendMsg(2);
}




export { socket, msg, kickUser, banUser, transferAdmin, imAdmin };