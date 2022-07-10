import { users } from './db/users.js';
import { sessionDB } from './index.js';

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

export { setSocket, getSocket };