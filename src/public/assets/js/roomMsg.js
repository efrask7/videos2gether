let imAdmin = false;

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

const removeUserTable = (user) => {
    const tr = document.getElementById(`tr_${user}`);
    tr.remove();
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

