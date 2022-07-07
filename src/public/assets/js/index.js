const register = document.getElementById('register');
const login = document.getElementById('login');

const showRegister = () => {
    login.classList.add('d-none');
    register.classList.remove('d-none');
}

const showLogin = () => {
    register.classList.add('d-none');
    login.classList.remove('d-none');
}

const modal = document.getElementById('modal');

const mymodal = new bootstrap.Modal(modal);

const showErr = () => {
    const data = new URLSearchParams(window.location.search);

    if (data.get('error')) {
        document.getElementById('err').innerHTML = data.get('error');

        let text = document.getElementById('text');

        switch (data.get('code')) {

            case "1":
                text.innerHTML = 'Ese usuario ya esta registrado';
                break;
            case "2":
                text.innerHTML = 'Ese usuario no existe';
                showLogin();
                break;
            case "3":
                text.innerHTML = 'La contraseña que ingresaste es incorrecta';
                showLogin();
                break;
        }

        mymodal.show();
    }
}

const showLoginModal = () => {
    const data = new URLSearchParams(window.location.search);

    if (data.get('login')) {
        new bootstrap.Modal(document.getElementById('modal2')).show();
    }
}

if (window.location.search) {
    showErr();
    showLoginModal();
}

