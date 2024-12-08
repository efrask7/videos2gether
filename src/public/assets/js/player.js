import { socket } from '/assets/js/socketScript.js';

const data = new URLSearchParams(window.location.search);
const username = document.getElementById('user').innerHTML;

const player = document.getElementById('video_player');
//const playerAud = document.getElementById('audio_player');

const getMinutes = (s) => { //FUNCION PARA PASAR DE SEGUNDOS A MINUTOS

    if (!s) return `00:00`

    var minutes = Math.floor(s/60);
    var seconds = undefined;

    if (minutes < 10) minutes = `0${minutes}`;

    if (s % 60 != 0) {
        seconds = Math.floor(s-(60 * minutes));
        if (seconds < 10) seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

if (data.get('video')) { //SI SE ESTA REPRODUCIENDO UN VIDEO LO PONE EN EL REPRODUCTOR

    player.src = `rooms/${data.get('id')}/${data.get('video')}.mp4`;
    player.currentTime = data.get('current');

    //playerAud.src = `rooms/${data.get('id')}/${data.get('video')}.mp3`;
    //playerAud.currentTime = data.get('current');

    switch (data.get('status')) {

        case "playing":
            player.autoplay = true;
            player.muted = true; 
            //playerAud.muted = true;
            //playerAud.autoplay = true;
            break;
        case "paused":
            player.pause();
            //playerAud.pause();
            break;
    };

    document.getElementById('title').innerHTML = data.get('title');
};

const sendUrl = (id, name) => { //MANDA LA URL AL SERVIDOR PARA REPRODUCIRLO
    let vid = {
        name: name,
        url: `https://www.youtube.com/watch?v=${id}`
    };

    socket.emit('url', vid);
}

player.addEventListener('ended', () => { //CUANDO EL REPRODUCTOR TERMINA DE REPRODUCIR EL VIDEO EMITE QUE TERMINO ASI ACTUALIZA LA BASE DE DATOS
    socket.emit('finish');
    socket.emit('currentTime', player.currentTime);
});

//player.addEventListener('mouseenter', () => {
    //if (playerAud.muted) playerAud.muted = false;
//})

//FUNCIONES PARA PAUSAR, REPRODUCIR, etc EL VIDEO
const pause = () => {
    if (player.paused) return;
    socket.emit('pause', username);
};

const resume = () => {
    if (!player.paused) return;
    socket.emit('resume', username);
};

const previous = () => {
    socket.emit('previous', username);
};

const next = () => {
    socket.emit('next', username);
};

//CAMBIA EL VOLUMEN DEL REPRODUCTOR

const input_vol = document.getElementById('volume');

input_vol.addEventListener('input', () => {
    if (player.muted) player.muted = false;

    player.volume = input_vol.value;
});

export { sendUrl, getMinutes, pause, resume, previous, next };