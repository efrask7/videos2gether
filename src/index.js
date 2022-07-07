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
import { getVideo } from './ytdl-functions.js';
import { playingVideo } from './rooms_functions.js';

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

app.get('/', (req, res) => {

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

        return res.render('index.ejs', { user: data });
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

            res.render('index.ejs', { user: data });
        }); 
    } else res.sendFile(`${__dirname}/public/login.html`);

});

app.post('/', (req, res) => {
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

app.post('/room', (req, res) => {
    let secret;

    if (req.body.password) secret = true;
    else secret = false;

    addRoom(req.body.name, secret, req.body.password, (id) => {
        if (secret) return res.redirect(`/room/${id}?password=${req.body.password}`);

        res.redirect(`/room/${id}`);
    });
});

app.get('/room', (req, res) => {
    if (req.query.exit) {
        req.session.room = 0;
        req.session.roomPw = null;
    }

    if (!req.query.name && !req.query.id) return res.redirect('/');

    if (req.query.id) {
        searchRoom(null, req.query.password, req.query.id, (correctPw, name) => {
            if (!correctPw) {
                return res.redirect(`/?id=${req.query.id}&err=1`);
            } 
            
            req.session.room = req.query.id;
            req.session.roomPw = req.query.password;

            if (!req.query.video) {
                playingVideo(req.query.id, (roomFounded, video_id, time, status) => {
                    if (!roomFounded) return;
    
                    res.redirect(`/room?id=${req.query.id}&password=${req.query.password}&video=${video_id}&current=${time}&status=${status}`);
                });
            } else res.render('room.ejs', { room: { id: req.query.id, name: name }, user: { user: req.session.username } });
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
    })



    io.emit('user_connected', `Usuario (${socket.id}) se conecto Pog`);

    socket.on('url', (data) => {

        getVideo(data.url, id, data.name, (err, url) => {
            if (err) {
                console.log('Ocurrio un error inesperado');
                return io.in(id).emit('video_error', 'Ocurrio un error por parte del servidor :(');
            }

            io.in(id).emit('video', url);
        })


    });
});

httpServer.listen(5000).on('listening', () => console.log(`Servidor iniciado en el puerto 5000`));