import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import { users } from './db/users.js';
import { rooms } from './db/rooms.js';
import { newUser, searchUser, addRoom, searchRoom, searchRoomByName } from './db/functions.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { session_sequelize } from './db/session.js';
import { getVideo, getVideoAndAudio } from './ytdl-functions.js';
import { addOnlineM, addUserToRoom, changeName, changePw, deleteRoom, getAdmin, getAllRooms, getDurationActual, getHistory, getMyRooms, getUsers, nextV, playingVideo, previousV, removeOnlineM, removeUserFromRoom, restartOnlineUsers, stopV, updateStatus, updateTime } from './rooms_functions.js';
import { getSocket, getUserFromSocket, setSocket, banUser, checkBan, transferAdm, getRoomsBans, delBan } from './users_functions.js';
import { channel, searchVideo } from './yt_api.js';

const sequelizeS = SequelizeStore(session.Store); //PARA GUARDAR LA SESION EN LA BASE DE DATOS DE SEQUELIZE

const __dirname = dirname(fileURLToPath(import.meta.url)); //__dirname no viene incluido en es6 asi que hay que hacer uno manual

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer); //servidor socket.io para comuniar server/cliente

const sessionDB = new sequelizeS({ //BASE DE DATOS PARA LAS SESIONES
    db: session_sequelize,
});

let uSession = session({ //LA SESION PARA PASARLA AL MIDDLEWARE
    secret: "secreto__lol",
    store: sessionDB,
    resave: false,
    saveUninitialized: false
});

//MIDDLEWARES QUE USO
app.use(express.static('src/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(uSession);
app.set('view engine', 'ejs'); //EL VIEW ENGINE, PARA RENDERIZAR ARCHIVOS .ejs (similar a php)
app.set('views', 'src/views'); 

const DbInit = async () => { //FUNCION PARA CREAR LAS BASES DE DATOS (si no estan creadas)
    await users.sync();
    await rooms.sync();
    sessionDB.sync();
    restartOnlineUsers();
    console.log('Base de datos cargada');
}

DbInit();

app.get('/', async (req, res) => {

    let publicR = await getAllRooms(); //CARGA LAS SALAS PUBLICAS PARA MOSTRARLAS
    let iHaveRooms = false;

    if (req.session.username) iHaveRooms = await getMyRooms(req.session.username); /*
    PARA SABER SI EL USUARIO TIENE SALAS CREADAS Y LAS MUESTRA, para editarlas, ver contraseña, etc
    */

    if (req.query.deleteR) { //SI EN LA URL SE PASA EL PARAMETRO PARA BORRAR UNA SALA
        if (await getAdmin(req.query.id, req.session.username)) { //REVISA SI ES ADMIN DE LA SALA
            if (await deleteRoom(req.query.id)) { //Y LA BORRA
                return res.redirect('/?success=1');
            } else return res.redirect('?success=0'); //DE LO CONTRARIO NO
        }
    }
    
    if (req.session.username) { //SI YA HAY UNA SESION INICIADA
        let data = {
            method: "get",
            found: true,
            user: req.session.username,
        }

        if (req.query.delete) { //VERIFICA SI QUIERE CERRAR SESION
            req.session.destroy();
            return res.redirect('/');
        }

        //SI ESTA CONECTADO A UNA SALA, LO MANDA A ESA
        if (req.session.room && req.session.room != 0) return res.redirect(`/room?id=${req.session.room}&password=${req.session.roomPw}`);

        //SI SE PIDE PARA SACARLE EL BAN A ALGUIEN
        if (req.query.delBan) {
            if (await getAdmin(req.query.id, req.session.username)) {
                delBan(req.query.delBan, req.query.id);
                return res.redirect('/?bansucessful=1');
            }
        }

        //PARA VER LA LISTA DE BANEOS DE UNA SALA (no es necesario ser admin, solo para sacar el baneo)
        if (req.query.banlist) {
            if (await getAdmin(req.query.banlist, req.session.username)) {
                return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms, list: true, bans: await getRoomsBans(req.query.banlist), imAdmin: true, room: req.query.banlist, search: false });
            } else return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms, list: true, bans: await getRoomsBans(req.query.banlist), imAdmin: false, search: false });
        }

        //SI EL USUARIO TIENE SALAS CREADAS, LAS MUESTRA, SINO LO MANDA A LA PAGINA NORMAL
        if (iHaveRooms) {
            return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms, list: false, search: false });
        } else return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: false, list: false, search: false });
    }   

    //SI SE PASA EL PARAMETRO DE USUARIO (se pasa cuando uno inicia sesion)
    if (req.query.username) {
        //busca al usuario con la funcion y llama a un callback para verificar si existe o si la contraseña es correcta
        searchUser(req.query.username, req.query.password, async (exist, correctPassword) => {
            let data = {
                method: "get",
                user: req.query.username,
            }

            //SI EL USUARIO NO EXISTE LO REDIRECCIONA CON UN ERROR
            if (!exist) {
                data.found = false;
                return res.redirect('/?error=iniciar+sesion&code=2');
            }

            data.found = true;
            
            //SI LA CONTRASEÑA ES INCORRECTA LO MANDA AL INICIO CON UN ERROR
            if (!correctPassword) {
                data.error = true;
                return res.redirect('/?error=iniciar+sesion&code=3');
            }

            //GUARDA LA SESION
            req.session.username = req.query.username;

            iHaveRooms = await getMyRooms(req.query.username)

            if (iHaveRooms) return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms, list: false, search: false });

            res.render('index.ejs', { user: data, rooms: publicR, iHaveR: false, list: false, search: false });
        }); 
    } else res.sendFile(`${__dirname}/public/login.html`); //SI NO ESTA INICIANDO SESION LO MANDA AL INICIO DE SESION

});

app.post('/', async (req, res) => {

    //REGISTRA UN NUEVO USUARIO
    newUser(req.body.username, req.body.password, (error, data) => {
        let uData = {
            method: "post",
            user: req.body.username
        };
        if (!error) {
            res.redirect('/?login=true'); //VERIFICA QUE NO HAYA ERROR
        } else if (error) {
            uData.error = true;
            res.redirect('/?error=registrarte&code=1');
        };
    });
});

app.post('/newPass', async (req, res) => { 
    
    //SE CAMBIA LA CONTRASEÑA DE UNA SALA
    if (await getAdmin(req.body.newId, req.session.username)) {

        changePw(req.body.newId, req.body.password);
        return res.redirect('/?success=2');

    } else return res.redirect('/?success=-2');
});

app.post('/newName', async (req, res) => {

    //SE CAMBIA EL NOMBRE DE UNA SALA
    if (await getAdmin(req.body.newId, req.session.username)) {

        changeName(req.body.newId, req.body.name);
        return res.redirect('/?success=3');

    } else return res.redirect('/?success=-3');
});

app.post('/room', (req, res) => {
    let secret;

    //SE CREA UNA NUEVA SALA
    if (req.body.password) secret = true;
    else secret = false;

    addRoom(req.body.name, req.session.username, secret, req.body.password, (id) => {
        if (secret) return res.redirect(`/room?id=${id}&password=${req.body.password}`);

        res.redirect(`/room?id=${id}`); //LO REDIRECCIONA A LA SALA, DEPENDIENDO SI TENGA CONTRASEÑA O NO
    });
});

app.get('/room', async (req, res) => {
    console.log(req.query);

    //AL INTENTAR ENTRAR A UNA SALA,

    //VERIFICA SI QUIERE SALIRSE DE UNA
    if (req.query.exit) {

        req.session.room = 0;
        req.session.roomPw = null;

        //VERIFICA SI LO EXPULSARON O BANEAROM
        if (req.query.kicked) return res.redirect('/?err=kicked'); 
        if (req.query.banned) return res.redirect('/?err=banned');
        return res.redirect('/');
    }

    //SI NO ESTA EL PARAMETRO 'name' o 'id' LO MANDA DE REGRESO
    if (!req.query.name && !req.query.id) return res.redirect('/');


    //SI BUSCA LA SALA POR NOMBRE
    if (req.query.name) {
        let rooms = await searchRoomByName(req.query.name);
        let publicR = await getAllRooms();

        //Y MANDA EL RESULTADO

        if (!rooms) return res.render('index.ejs', { user: { username: req.session.username }, rooms: publicR, iHaveR: false, list: false, search: req.query.name, foundR: false } );

        return res.render('index.ejs', { user: { username: req.session.username }, rooms: publicR, iHaveR: false, list: false, search: req.query.name, foundR: rooms } );
    }

    //SI ES POR ID
    if (req.query.id) {
        searchRoom(null, req.query.password, req.query.id, async (correctPw, name, online) => {
            if (!correctPw) { //VERFIICA QUE LA CONTRASEÑA ESTE BIEN O LA SALA EXISTA
                return res.redirect(`/?id=${req.query.id}&err=1`);
            } 

            //SI ESTA BANEADO
            if (await checkBan(req.session.username, req.query.id)) {
                return res.redirect('/?err=banned');
            }
            
            //GUARDA LA SALA EN LA SESION
            req.session.room = req.query.id;
            req.session.roomPw = req.query.password;

            //SI HAY EN LA URL NO PASARON UN PARAMETRO DE VIDEO
            if (!req.query.video) {

                //PREGUNTA SI HAY VIDEOS REPRODUCIENDOSE
                playingVideo(req.query.id, async (roomFounded, video_id, time, status, title) => {
                    if (!roomFounded) return;
                    if (!video_id) return res.render('room.ejs', { room: { id: req.query.id, name: name, pw: req.query.password, users: online }, user: { user: req.session.username, admin: await getAdmin(req.query.id, req.session.username) } });
    
                    res.redirect(`/room?id=${req.query.id}&password=${req.query.password}&video=${video_id}&current=${time}&status=${status}&title=${title}`);
                });
            } else res.render('room.ejs', { room: { id: req.query.id, name: name, pw: req.query.password, users: online }, user: { user: req.session.username, admin: await getAdmin(req.query.id, req.session.username) } });
        });
    }
});


//MIDDLEWARE PARA EL SERVIDOR SOCKET (para pasarle la sesion actual)
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(uSession));

io.use(async (socket, next) => {

    //GUARDA EL ID DE UN USUARIO

    let sessionSocket = await getSocket(socket.request.session.username);

    if (!sessionSocket) return next();

    socket.id = sessionSocket;

    next();
})


//CUANDO UN CLIENTE SE CONECTA A UNA SALA
io.on('connection', async (socket) => {

    let id;
    let user;

    socket.on('connected', async (data) => {

        //LO CONECTA A LA SALA
        socket.join(data.room);
        console.log(`Agregado el id ${socket.id} | ${data.user} a la sala ${data.room}`);
        
        //EMITE EL EVENTO DE QUE ENTRO ALGUIEN
        io.in(data.room).emit('userJoin', { user: data.user, uId: socket.id });

        //GUARDA LAS VARIABLES
        id = data.room;
        user = data.user;

        addOnlineM(id); //GUARDA LA CONEXION EN LA DB

        if (await getSocket(data.user)) { //VERIFICA QUE TENGA UN SOCKET EN LA DB
            console.log(`${data.user} ya tiene su propia ID`);
        } else setSocket(data.user, socket.id); //SI NO TIENE, LO REGISTRA


        //PREGUNTA SI ES ADMIN DE LA SALA
        if (await getAdmin(data.room, data.user)) socket.emit('admin', true);

        //LO AGREGA A LA SALA EN LA DB
        addUserToRoom(data.room, data.user);

        let users = await getUsers(data.room); ///PIDE LOS NOMBRES DE LOS CONECTADOS

        setTimeout(() => {
            socket.emit('addUsers', users);  //Y SE LO MANDA AL CLIENTE
        }, 3000);
        
    });

    //SI EL USUARIO PIDE EL HISTORIAL DE LA SALA
    socket.on('getHistory', async () => { 
        if (await getHistory(id)) {
            let videos = await getHistory(id);

            socket.emit('history', videos);
        } else socket.emit('history', false);
    });

    //UN USUARIO ES EXPULSADO
    socket.on('kick', async data => {
        if (!data.user) return;

        let kicked = await getSocket(data.user);

        if (await getAdmin(id, user)) {
            io.in(id).emit('kicked', { id: kicked, username: data.user });
        } else return;
    });

    //UN USUARIO ES BANEADO
    socket.on('ban', async data => {
        if (!data.user) return;

        let banned = await getSocket(data.user);

        if (await getAdmin(id, user)) {
            io.in(id).emit('banned', { id: banned, username: data.user });
            banUser(data.user, id);
        } else return;
    });

    //SE TRANSFIERE EL ADMIN DE UN USUARIO A OTRO
    socket.on('newAdmin', async data => {
        if (!data.user) return;

        let newAdm = await getSocket(data.user);

        if (await getAdmin(id, user)) {
            io.in(id).emit('newAdmin', { id: newAdm, username: data.user });
            transferAdm(data.user, id);
        } else return;
    });

    //CUANDO MANDAS UN MENSAJE
    socket.on('msg', (data) => {
        console.log(data);
        let data_send = {
            name: data.name,
            message: data.message
        }

        io.in(data.room).emit('msg', data_send);
    });

    //USUARIO SE DESCONECTA
    socket.on('disconnect', () => {
        io.in(id).emit('userLeave', user);
        removeOnlineM(id);
        removeUserFromRoom(id, user);
    });

    //RECIBE EL TIEMPO EN QUE ESTA EL REPRODUCTOR
    socket.on('currentTime', time => {
        updateTime(id, time);
    });
    
    //MANDA ESE TIEMPO AL USUARIO QEU ACABA DE ENTRAR
    socket.on('getDuration', async () => {
        socket.emit('durationV', await getDurationActual(id));
    })

    //CUANDO UN USUARIO CONTROLA AL REPRODUCTOR
    socket.on('pause', e => {
        io.in(id).emit('paused', e);
        updateStatus(id, 'paused');
    });

    socket.on('resume', e => {
        io.in(id).emit('resumed', e);
        updateStatus(id, 'playing');
    });

    socket.on('previous', async e => {
        let vid = await previousV(id);

        if (vid) {
            io.in(id).emit('video', { name: vid.name, url: `rooms/${id}/${vid.id}.mp4`});
        }
    });

    socket.on('stop', e => {
        stopV(id);
    });

    socket.on('finish', () => {
        updateStatus(id, 'paused');
    })

    socket.on('next', async e => {
        let vid = await nextV(id);

        if (vid) {
            io.in(id).emit('video', { name: vid.name, url: `rooms/${id}/${vid.id}.mp4`});
        }
    });

    socket.on('changeTime', time => {
        io.in(id).emit('newTime', time);
    });


    //CUANDO UN USUARIO BUSCA UN VIDEO
    socket.on('searchV', query => {
        searchVideo(query, (r) => {
            for (let i = 0; i < 10; i++) {
                if (!r.items[i]) break;
                channel(r.items[i].snippet.channelId, (ch) => {

                    let data = { title: r.items[i].snippet.title, video_img: r.items[i].snippet.thumbnails.high.url, id: r.items[i].id.videoId, creator: ch.items[0].snippet.title, creator_img: ch.items[0].snippet.thumbnails.default.url }

                    socket.emit('resultV', data);
                })
            }
        })
    });



    io.emit('user_connected', { s_id: socket.id });

    //RECIBE LA URL DEL VIDEO
    socket.on('url', (data) => {

        getVideo(data.url, id, data.name, (err, url) => {
            if (err) {
                console.log('Ocurrio un error inesperado');
                return io.in(id).emit('video_error', 'Ocurrio un error por parte del servidor :(');
            }

            io.in(id).emit('video', { name: data.name, url: url }); //Y MANDA EL VIDEO SI NO HAY ERRORES
        })


    });
});

//EJECUTA EL SERVIDOR :)

httpServer.listen(5000).on('listening', () => console.log(`Servidor iniciado en el puerto 5000`));