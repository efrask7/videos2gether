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
    //newTdK_a.onclick;
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
    //newTdB_a.onclick;
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
    //newTdA_a.onclick;
    newTdA_a.classList.add('text-primary');
    let newTdA_i = document.createElement('i');
    newTdA_i.classList.add('bi');
    newTdA_i.classList.add('bi-star');

    newTdA_a.appendChild(newTdA_i);
    newTdAdmin.appendChild(newTdA_a);

    //

    newTr.appendChild(newThN);
    newTr.appendChild(newTdKick);
    newTr.appendChild(newTdBan);
    newTr.appendChild(newTdAdmin);

    table.appendChild(newTr);
};

const removeUserTable = (user) => {
    const tr = document.getElementById(`tr_${user}`);
    tr.remove();
}