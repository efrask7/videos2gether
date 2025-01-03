import { rooms } from './db/rooms.js';
import { Op } from 'sequelize';

/*FUNCIONES PARA LAS SALAS
EJ: buscar un nuevo id para cuando se manda un nuevo video
basicamente son funciones para actualizar datos de la base de datos de 'rooms'

son muchas pero creo que con el nombre y los parametros es entendible que hacen
*/



const newValue = (name, url) => {
    return {
        name,
        url
    };
};

const defaultValue = (name, url) => {
    return {
        1: {
            name,
            url
        }
    }
};

const findNewId = async (room) => {
    const tag = await rooms.findOne({ where: {id: room } });
    if (!tag) return 0;

    let videos = JSON.parse(tag.get('videos'));

    let count = 0;

    for (let i in videos) {
        count++;
    }

    return count+1;
};

const updateVideos = async (room, video) => {
    console.log('hola si llegando', room)
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    if (!tag.get('videos')) {
        rooms.update({ videos: JSON.stringify(defaultValue(video.name, video.url)) }, { where: {id: room} });
        return 1;
    }

    let videos = JSON.parse(tag.get('videos'));

    videos[await findNewId(room)] = newValue(video.name, video.url);

    rooms.update({ videos: JSON.stringify(videos) }, { where: {id: room} });

    return (await findNewId(room)-1);
};

const playing = async (room, num) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    rooms.update({ status: 'playing' }, { where: {id: room} });
    rooms.update({ playing: num }, { where: {id: room} });
};

const noPlaying = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    rooms.update({ playing: null }, { where: {id: room} });
};

const playingVideo = async (room, callback) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return callback(false);

    if (tag.get('playing')) {
        let videos = JSON.parse(tag.get('videos'));

        return callback(true, tag.get('playing'), tag.get('current'), tag.get('status'), tag.get('playing') ? videos[tag.get('playing')].name : null);
    }
    else return callback(true, false);
};

const updateTime = async (room, time) => {

    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    if (tag.get('status') == 'stopped') {
        await rooms.update({ current: 0 }, { where: {id: room} });
    } else await rooms.update({ current: time }, { where: {id: room} });
};

const previousV = async (room) => {

    const tag = await rooms.findOne({ where: {id: room} });

    let videos = JSON.parse(tag.get('videos'));

    if (videos[(tag.get('playing') - 1)]) {
        await rooms.update({ playing: (tag.get('playing') - 1) }, { where: {id: room} });
        await tag.reload();
        return videos[tag.get('playing')];
    } else return false;
};

const nextV = async (room) => {

    const tag = await rooms.findOne({ where: {id: room} });

    let videos = JSON.parse(tag.get('videos'));

    if (videos[(tag.get('playing') + 1)]) {
        await rooms.update({ playing: (tag.get('playing') + 1) }, { where: {id: room} });
        await tag.reload();
        return videos[tag.get('playing')];
    } else return false;
};

const stopV = async (room) => {
    await rooms.update({ status: 'stopped' }, { where: {id: room} });
};

const updateStatus = async (room, status) => {
    await rooms.update({ status: status }, { where: {id: room} });
}

const getDurationActual = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    return tag.get('current');
}

const getAllRooms = async () => {
    const tags = await rooms.findAll({ where: {private: 0} });

    let data = {};
    for (let i in tags) {
        data[i] = { name: tags[i].name, id: tags[i].id, online: tags[i].online };
    }

    return data;
}

const addOnlineM = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    tag.increment('online');
}

const removeOnlineM = async (room) => {
    const tag = await rooms.findOne({ where: {id: room } });
    tag.decrement('online');
}

const getMyRooms = async (user) => {
    const tags = await rooms.findAll({ where: {admin: user} });
    if (!tags) return false;

    let data = {};

    for (let i in tags) {
        data[i] = { name: tags[i].name, 
                    id: tags[i].id, 
                    online: tags[i].online, 
                    private: tags[i].private, 
                    pw: tags[i].password,
                    totalVideos: (await findNewId(tags[i].id)-1)
                };
    }

    if (!data[0]) return false;

    return data;
}

const deleteRoom = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return false;

    tag.destroy();
    console.log(`Sala ${room} borrada`);
    return true;
}

const getAdmin = async (room, user) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return false;

    if (tag.get('admin') == user) return true;

    return false;
}

const changePw = async (room, newPass) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return false;

    rooms.update({ password: newPass }, { where: {id: room} });

    if (tag.get('private') == 0) tag.increment('private');

    if (!newPass && tag.get('private') == 1) tag.decrement('private');

    console.log(`La contraseña de la sala ${room} ha sido cambiada`);
    return true;
};

const changeName = async (room, newName) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag || !newName) return false;

    rooms.update({ name: newName }, { where: {id: room} });

    console.log(`El nombre de la sala ${room} ha sido cambiado`);
    return true;
}

const addUserToRoom = async (room, name) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let users = JSON.parse(tag.get('users'));

    if (!users.users[0]) {
        users.users[0] = name;
        await rooms.update({ users: JSON.stringify(users) }, { where: {id: room} });
        return;
    }

    for (let i in users.users) {
        if (users.users[i] == name) return;
    }

    users.users.push(name);

    await rooms.update({ users: JSON.stringify(users) }, { where: {id: room} });
}

const removeUserFromRoom = async (room, name) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let users = JSON.parse(tag.get('users'));

    let newUsers = [];

    for (let i in users.users) {
        if (users.users[i] == name) continue;
        newUsers.push(users.users[i]);
    }

    let json = { users: newUsers };

    await rooms.update({ users: JSON.stringify(json) }, { where: {id: room} });
}

const getUsers = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let users = JSON.parse(tag.get('users'));

    return Array(users.users);
}

const restartOnlineUsers = async () => {
    await rooms.update({ online: 0 }, { where: {online: { [Op.gt]: 0 }}});
}

const getHistory = async room => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let history = JSON.parse(tag.get('videos'));

    if (!history) return false;

    let name = [];

    for (let i in history) {
        name.push(history[i].name);
    }

    return name;
}

const getVideoFromRoom = async (room, id) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return false;

    let videos = JSON.parse(tag.get('videos'));

    return videos[id];
}


export { getVideoFromRoom, findNewId, updateVideos, playing, noPlaying, playingVideo, updateTime, previousV, nextV, stopV, updateStatus, getDurationActual, getAllRooms, addOnlineM, removeOnlineM, getMyRooms, deleteRoom, getAdmin, changePw, changeName, addUserToRoom, getUsers, removeUserFromRoom, getHistory, restartOnlineUsers };