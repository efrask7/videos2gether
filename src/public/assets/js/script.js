import { socket, msg } from '/assets/js/socketScript.js';
import { addVideo } from '/assets/js/roomMsg.js';

document.getElementById('url_location').innerHTML = window.location.host;

const copyUrl = (id, pw) => {
    let url = `http://${window.location.host}/room?id=${id}&password=${pw}`;
    navigator.clipboard.writeText(url);
}

let data = new URLSearchParams(window.location.search);
const username = document.getElementById('user').innerHTML;

const input_msg = document.getElementById('input-msg');
const input_msg_mobile = document.getElementById('input-msg_mobile');

const sendMsg = (num) => { //FUNCION PARA LOS INPUTS DEL CHAT
    if (num == 1) {
        if (input_msg.value == '') return;
        msg(input_msg.value);
        input_msg.value = '';
    } else if (num == 2) {
        if (input_msg_mobile.value == '') return;
        msg(input_msg_mobile.value);
        input_msg_mobile.value = '';
    }
}

const search = () => { //FUNCION PARA BUSCAR VIDEOS

    clearSearch();

    const input = document.getElementById('search-q');

    socket.emit('searchV', input.value);
}

const results = document.getElementById('modal');
let resultsOnScreen = false;

socket.on('resultV', data => { //EL SERVIDOR ENVIA LOS RESULTADOS Y LOS MUESTRA
    addVideo(data.title, data.video_img, data.id, data.creator, data.creator_img);

        // if (!resultsOnScreen) {
        //     new bootstrap.Modal(results).show();
        //     resultsOnScreen = true;
        // }
});

results.addEventListener('hidden.bs.modal', () => resultsOnScreen = false );

const clearSearch = () => { //LIMPIA LOS RESULTADOS
    while (true) {
        let searchs = document.getElementsByClassName('video');

        if (!searchs[0]) break;
        else searchs[0].remove();
    }
}

window.history.pushState(null, null, `${window.location.pathname}?id=${data.get('id')}`);

export { sendMsg, search };