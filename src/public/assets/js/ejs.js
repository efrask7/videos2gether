const showName = () => {
    document.getElementById('divName').classList.remove('d-none');
    document.getElementById('divId').classList.add('d-none');
    document.getElementById('btnName').disabled = true;
    document.getElementById('btnId').disabled = false;

    document.getElementById('roomId').required = false;
    document.getElementById('roomName').required = true;
}

const showId = () => {
    document.getElementById('divId').classList.remove('d-none');
    document.getElementById('divName').classList.add('d-none');
    document.getElementById('btnId').disabled = true;
    document.getElementById('btnName').disabled = false;

    document.getElementById('roomName').required = false;
    document.getElementById('roomId').required = true;
}

const showIdTab = () => {
    document.getElementById('nav-create').classList.remove('show');
    document.getElementById('nav-create').classList.remove('active');

    document.getElementById('nav-join').classList.add('show');
    document.getElementById('nav-join').classList.add('active');
}

const modal = new bootstrap.Modal(document.getElementById('modal'));
const errTitle = document.getElementById('err-title');
const errText = document.getElementById('err-text');

const roomId = document.getElementById('roomId');

if (window.location.search) {

    const data = new URLSearchParams(window.location.search);
    let id = data.get('id');

    if (data.get('err')) {
        
        switch (data.get('err')) {

            case "1":
                errTitle.innerHTML = `Error al entrar a la sala ${id}`;
                errText.innerHTML = 'La contraseña es incorrecta';
                showIdTab();
                showId();
                roomId.value = id;
                modal.show();
                break;
        }
    }
}

window.history.pushState(null, null, `${window.location.pathname}`);