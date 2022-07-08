import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ytdl from 'ytdl-core';
import fs from 'fs';
import bodyParser from 'body-parser';
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import { users } from './db/users.js';
import { rooms } from './db/rooms.js';
import { newUser, searchUser, addRoom, searchRoom } from './db/functions.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { session_sequelize } from './db/session.js';
import { getVideo, getVideoAndAudio } from './ytdl-functions.js';
import { addOnlineM, changeName, changePw, deleteRoom, getAdmin, getAllRooms, getDurationActual, getMyRooms, nextV, playingVideo, previousV, removeOnlineM, stopV, updateStatus, updateTime } from './rooms_functions.js';

const sequelizeS = SequelizeStore(session.Store);

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const sessionDB = new sequelizeS({
    db: session_sequelize,
});

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
    secret: "secreto__lol",
    store: sessionDB,
    resave: false,
}));
app.set('view engine', 'ejs');

const DbInit = async () => {
    await users.sync();
    await rooms.sync();
    sessionDB.sync();
    console.log('Base de datos cargada');
}

DbInit();

app.get('/', async (req, res) => {

    let publicR = await getAllRooms();
    let iHaveRooms = false;

    if (req.session.username) iHaveRooms = await getMyRooms(req.session.username);

    if (req.query.deleteR) {
        if (await getAdmin(req.query.id, req.session.username)) {
            if (await deleteRoom(req.query.id)) {
                return res.redirect('/?success=1');
            } else return res.redirect('?success=0')
        }
    }
    
    if (req.session.username) {
        let data = {
            method: "get",
            found: true,
            user: req.session.username,
        }

        if (req.query.delete) {
            req.session.destroy();
            return res.redirect('/');
        }

        if (req.session.room && req.session.room != 0) return res.redirect(`/room?id=${req.session.room}&password=${req.session.roomPw}`);

        if (iHaveRooms) {
            return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms });
        } else return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: false, });
    }

    if (req.query.username) {
        searchUser(req.query.username, req.query.password, (exist, correctPassword) => {
            let data = {
                method: "get",
                user: req.query.username,
            }
            if (!exist) {
                data.found = false;
                return res.redirect('/?error=iniciar+sesion&code=2');
            }

            data.found = true;

            if (!correctPassword) {
                data.error = true;
                return res.redirect('/?error=iniciar+sesion&code=3');
            }

            req.session.username = req.query.username;

            if (iHaveRooms) return res.render('index.ejs', { user: data, rooms: publicR, iHaveR: true, myRooms: iHaveRooms });

            res.render('index.ejs', { user: data, rooms: publicR, iHaveR: false });
        }); 
    } else res.sendFile(`${__dirname}/public/login.html`);

});

app.post('/', async (req, res) => {

    newUser(req.body.username, req.body.password, (error, data) => {
        let uData = {
            method: "post",
            user: req.body.username
        };
        if (!error) {
            res.redirect('/?login=true');
        } else if (error) {
            uData.error = true;
            res.redirect('/?error=registrarte&code=1');
        };
    });
});

app.post('/newPass', async (req, res) => {
    if (await getAdmin(req.body.newId, req.session.username)) {
        changePw(req.body.newId, req.body.password);
        return res.redirect('/?success=2')
    } else return res.redirect('/?success=-2');
});

app.post('/newName', async (req, res) => {
    if (await getAdmin(req.body.newId, req.session.username)) {
        changeName(req.body.newId, req.body.name);
        return res.redirect('/?success=3')
    } else return res.redirect('/?success=-3');
});

app.post('/room', (req, res) => {
    let secret;

    if (req.body.password) secret = true;
    else secret = false;

    addRoom(req.body.name, req.session.username, secret, req.body.password, (id) => {
        if (secret) return res.redirect(`/room?id=${id}&password=${req.body.password}`);

        res.redirect(`/room?id=${id}`);
    });
});

app.get('/room', (req, res) => {
    if (req.query.exit) {
        req.session.room = 0;
        req.session.roomPw = null;
    }

    if (!req.query.name && !req.query.id) return res.redirect('/');

    if (req.query.id & !req.query.err) {
        searchRoom(null, req.query.password, req.query.id, (correctPw, name) => {
            if (!correctPw) {
                return res.redirect(`/?id=${req.query.id}&err=1`);
            } 
            
            req.session.room = req.query.id;
            req.session.roomPw = req.query.password;

            if (!req.query.video) {
                playingVideo(req.query.id, (roomFounded, video_id, time, status, title) => {
                    if (!roomFounded) return;
                    if (!video_id) return res.render('room.ejs', { room: { id: req.query.id, name: name, pw: req.query.password }, user: { user: req.session.username } });
    
                    res.redirect(`/room?id=${req.query.id}&password=${req.query.password}&video=${video_id}&current=${time}&status=${status}&title=${title}`);
                });
            } else res.render('room.ejs', { room: { id: req.query.id, name: name, pw: req.query.password }, user: { user: req.session.username } });
        });
    }
});


io.on('connection', (socket) => {

    let id;
    let user;

    socket.on('connected', (data) => {
        socket.join(data.room);
        console.log(`Agregado el id ${socket.id} a la sala ${data.room}`);
        io.in(data.room).emit('userJoin', data.user);
        id = data.room;
        user = data.user;
        addOnlineM(id);
    });

    socket.on('msg', (data) => {
        console.log(data);
        let data_send = {
            name: data.name,
            message: data.message
        }

        io.in(data.room).emit('msg', data_send);
    });

    socket.on('disconnect', () => {
        io.in(id).emit('userLeave', user);
        removeOnlineM(id);
    });

    socket.on('currentTime', time => {
        updateTime(id, time);
    });
    
    socket.on('getDuration', async () => {
        socket.emit('durationV', await getDurationActual(id));
    })

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
    })



    io.emit('user_connected', { s_id: socket.id });

    socket.on('url', (data) => {

        getVideo(data.url, id, data.name, (err, url) => {
            if (err) {
                console.log('Ocurrio un error inesperado');
                return io.in(id).emit('video_error', 'Ocurrio un error por parte del servidor :(');
            }

            io.in(id).emit('video', { name: data.name, url: url });
        })


    });
});

httpServer.listen(5000).on('listening', () => console.log(`Servidor iniciado en el puerto 5000`));