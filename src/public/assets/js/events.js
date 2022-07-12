import { sendMsg, search } from '/assets/js/script.js';
import { getMinutes } from '/assets/js/player.js';
import { socket } from '/assets/js/socketScript.js';

const player = document.getElementById('video_player');

//EVENTOS PARA LOS INPUTS

const input_msg = document.getElementById('input-msg');
const input_msg_mobile = document.getElementById('input-msg_mobile');
const input_search = document.getElementById('search-q');
let onInput = false;
let onInputM = false;
let onInputS = false;

document.addEventListener('keydown', (e) => {
    if (onInput && e.key == 'Enter') sendMsg(1);
    if (onInputM && e.key == 'Enter') sendMsg(2);
    if (onInputS && e.key == 'Enter') search();
});

input_msg.addEventListener('focus', () => {
    onInput = true;
});

input_msg.addEventListener('focusout', () => {
    onInput = false;
});

input_search.addEventListener('focus', () => {
    onInputS = true;
});

input_search.addEventListener('focusout', () => {
    onInputS = false;
});

input_msg_mobile.addEventListener('focus', () => {
    onInputM = true;
});

input_msg_mobile.addEventListener('focusout', () => {
    onInputM = false;
});

//EVENTOS PARA LA BARRA DE DURACION DEL VIDEO

let inputRange = false;

setInterval(() => {
    if (player.paused || player.ended || inputRange) return;
    document.getElementById('current-time').innerHTML = getMinutes(player.currentTime);
    document.getElementById('time-range').value = player.currentTime;
    document.getElementById('time-range').max = player.duration;
    document.getElementById('max-time').innerHTML = getMinutes(player.duration);

    //

    document.getElementById('current-time2').innerHTML = getMinutes(player.currentTime);
    document.getElementById('time-range2').value = player.currentTime;
    document.getElementById('time-range2').max = player.duration;
    document.getElementById('max-time2').innerHTML = getMinutes(player.duration);
}, 1000);

const t_range = document.getElementById('time-range');
const t_range2 = document.getElementById('time-range2');

t_range.addEventListener('input', () => {
    inputRange = true;

    document.getElementById('current-time').innerHTML = getMinutes(t_range.value);
});

t_range2.addEventListener('input', () => {
    inputRange = true;

    document.getElementById('current-time2').innerHTML = getMinutes(t_range2.value);
});

t_range.addEventListener('change', () => {
    inputRange = false;

    socket.emit('changeTime', t_range.value);
});

t_range2.addEventListener('change', () => {
    inputRange = false;

    socket.emit('changeTime', t_range2.value);
})