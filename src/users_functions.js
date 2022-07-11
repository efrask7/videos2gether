import { rooms } from './db/rooms.js';
import { users } from './db/users.js';

const setSocket = async (user, id) => {
    const tag = await users.findOne({ where: {username: user} });
    if (!tag) return;

    if (tag.get('socket_id')) return;

    await users.update({ socket_id: id }, { where: {username: user} });

    console.log(`Nuevo socket: ${id} | ${user}`);
}

const getSocket = async user => {
    const tag = await users.findOne({ where: {username: user} });
    if (!tag) return;

    if (!tag.get('socket_id')) return false;

    return tag.get('socket_id');
}

const getUserFromSocket = async socket_id => {
    const tag = await users.findOne({ where: {socket_id: socket_id} });
    if (!tag) return;

    return tag.get('username');
}

const banUser = async (user, room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let bans = JSON.parse(tag.get('banned'));

    if (!bans.users[0]) {
        bans.users[0] = user;
        await rooms.update({ banned: JSON.stringify(bans) }, { where: {id: room} });
        return;
    }

    for (let i in bans.users) {
        if (bans.users[i] == user) return;
    }

    bans.users.push(user);

    await rooms.update({ banned: JSON.stringify(bans) }, { where: {id: room} });
    console.log(`Se baneo al usuario ${user} de la sala ${room}`);
}

const checkBan = async (user, room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let bans = JSON.parse(tag.get('banned'));

    for (let i in bans.users) {
        if (bans.users[i] == user) return true;
    }

    return false;
}

const transferAdm = async (user, room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    rooms.update({ admin: user }, { where: {id: room} });
    console.log(`Nuevo administrador de la sala ${room}: ${user}`);
}

const getRoomsBans = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let bans = JSON.parse(tag.get('banned'));

    return Array(bans.users);
}

const delBan = async (user, room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return;

    let bans = JSON.parse(tag.get('banned'));
    let newBans = [];

    for (let i in bans.users) {
        if (bans.users[i] == user) continue;
        newBans.push(bans.users[i]);
    }

    let json = { users: newBans };
    
    await rooms.update({ banned: JSON.stringify(json) }, { where: {id: room} });
    console.log(`Se desbaneo al usuario ${user} de la sala ${room}`);
}

export { setSocket, getSocket, getUserFromSocket, banUser, checkBan, transferAdm, getRoomsBans, delBan };