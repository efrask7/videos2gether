import { kickUser, banUser, transferAdmin, imAdmin } from '/assets/js/socketScript.js';
import { sendUrl } from '/assets/js/player.js';

//FUNCIONES PARA AGREGAR ELEMENTOS

//AGREGAR UN USUARIO A LA LISTA
const addUserTable = (user) => {
    const table = document.getElementById('t-body');

    let newTr = document.createElement('tr');
    newTr.id = `tr_${user}`;

    let newThN = document.createElement('th');
    newThN.scope = 'row';
    newThN.innerHTML = user;

    let newTdKick = document.createElement('td');
    let newTdK_a = document.createElement('a');
    newTdK_a.type = 'button';
    newTdK_a.onclick = () => kickUser(user);
    newTdK_a.classList.add('text-warning');
    let newTdK_i = document.createElement('i');
    newTdK_i.classList.add('bi');
    newTdK_i.classList.add('bi-eject');

    newTdK_a.appendChild(newTdK_i);
    newTdKick.appendChild(newTdK_a);

    //

    let newTdBan = document.createElement('td');
    let newTdB_a = document.createElement('a');
    newTdB_a.type = 'button';
    newTdB_a.onclick = () => banUser(user);
    newTdB_a.classList.add('text-danger');
    let newTdB_i = document.createElement('i');
    newTdB_i.classList.add('bi');
    newTdB_i.classList.add('bi-x');

    newTdB_a.appendChild(newTdB_i);
    newTdBan.appendChild(newTdB_a);

    //

    let newTdAdmin = document.createElement('td');
    let newTdA_a = document.createElement('a');
    newTdA_a.type = 'button';
    newTdA_a.onclick = () => transferAdmin(user);
    newTdA_a.classList.add('text-primary');
    let newTdA_i = document.createElement('i');
    newTdA_i.classList.add('bi');
    newTdA_i.classList.add('bi-star');

    newTdA_a.appendChild(newTdA_i);
    newTdAdmin.appendChild(newTdA_a);

    //

    newTr.appendChild(newThN);

    if (imAdmin) {
        newTr.appendChild(newTdKick);
        newTr.appendChild(newTdBan);
        newTr.appendChild(newTdAdmin);
    }

    table.appendChild(newTr);
};

//SACAR UN USUARIO DE LA LISTA
const removeUserTable = (user) => {
    const tr = document.getElementById(`tr_${user}`);
    tr.remove();
}

//AGREGAR UN VIDEO AL RESULTADO
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
        new bootstrap.Toast(document.getElementById('downloadingVideo')).show();
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

//MENSAJES EN EL CHAT

//DIV DE LOS CHAT (NORMAL Y DE MOBILE)
const messageContainer = document.getElementById('messages');
const messageContainerM = document.getElementById('messagesMobile');
//

//CUANDO SE PAUSA O REPRODUCE EL VIDEO
const newStatus = (user, status) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let userS = document.createElement('span');
    userS.classList.add('join');
    userS.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = ` ${status} el video`;

    msgCont.appendChild(userS);
    msgCont.appendChild(msg);

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

//REPRODUCIENDO UN VIDEO
const nowPlaying = (title) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let vidN = document.createElement('span');
    vidN.classList.add('join');
    vidN.innerHTML = title;

    let msg = document.createElement('span');
    msg.innerHTML = 'Reproduciendo: ';

    msgCont.appendChild(msg);
    msgCont.appendChild(vidN);

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

//SE SALE UN USUARIO DE LA SALA
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

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

//ENTRA UN USUARIO A LA SALA
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

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

//SE MANDA UN MENSAJE
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

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

// MENSAJES DE ADMIN

const userLeaveAdmin = (user, action, message) => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let userC = document.createElement('span');
    userC.classList.add(action);
    userC.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = ` fue ${message} de la sala`;

    msgCont.appendChild(userC);
    msgCont.appendChild(msg);

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

const msgAdmin = user => {
    let msgCont = document.createElement('div');
    msgCont.classList.add('text-secondary');
    msgCont.classList.add('w-100');

    let userC = document.createElement('span');
    userC.classList.add('newAdm');
    userC.innerHTML = user;

    let msg = document.createElement('span');
    msg.innerHTML = ` es el nuevo administrador de la sala!`;

    msgCont.appendChild(userC);
    msgCont.appendChild(msg);

    let mobileMsg = msgCont.cloneNode(true);

    messageContainer.appendChild(msgCont);
    messageContainerM.appendChild(mobileMsg);
}

export { userJoin, addUserTable, removeUserTable, addVideo, msgAdmin, userLeaveAdmin, newMsgFr, userLeave, nowPlaying, newStatus, imAdmin }