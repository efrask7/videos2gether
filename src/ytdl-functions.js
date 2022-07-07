import ytdl from 'ytdl-core';
import fs from 'fs';
import { findNewId, updateVideos, playing } from './rooms_functions.js';

const getVideo = (url, room, vid_name, callback) => {
    let video = ytdl(url);

    fs.readdir(`public/rooms/${room}`, async (err, files) => {
        let video_id = await updateVideos(room, vid_name);
        if (err) fs.mkdir(`public/rooms/${room}`, (err) => {
            if (!err) {
                video.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp4`)).on('finish', () => {
                    console.log(`Video descargado para la sala ${room} | ${video_id}`);
                    playing(room, video_id);
                    return callback(false, `rooms/${room}/${video_id}.mp4`);
                });
            }
        });

        video.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp4`)).on('finish', () => {
            console.log(`Video descargado para la sala ${room} | ${video_id}`);
            playing(room, video_id);
            return callback(false, `rooms/${room}/${video_id}.mp4`);
        });
    }
)};

export { getVideo };