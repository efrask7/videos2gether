import ytdl from 'ytdl-core';
import fs from 'fs';
import { findNewId, updateVideos, playing } from './rooms_functions.js';

//ESTAS FUNCIONES SE ENCARGAN DE DESCARGAR UN VIDEO PARA QUE LAS SALAS PUEDAN VERLO

const getVideo = (url, room, vid_name, callback) => {
    let video = ytdl(url);

    fs.readdir(`public/rooms/${room}`, async (err, files) => { //LEE EL DIRECTORIO /ROOMS/
        let video_id = await updateVideos(room, vid_name);

        if (err) fs.mkdir(`public/rooms/${room}`, (err) => { //SI NO EXISTE EL DIRECTORIO CON LA SALA, LO CREA
            
            if (!err) {
                //DESCARGA EL VIDEO Y LO GUARDA 
                video.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp4`)).on('finish', () => {
                    console.log(`Video descargado para la sala ${room} | ${video_id}`);
                    
                    playing(room, video_id); //GUARDA EN LA DB QUE VIDEO SE ESTA REPRODUCIENDO

                    return callback(false, `rooms/${room}/${video_id}.mp4`); //Y MANDA EL CALLBACK PARA QUE EL SERVIDOR LO MANDE A LOS CLIENTES
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

//ESTE ES LO MISMO QUE EL DE ARRIBA, PERO CON EL AUDIO SEPARADO
//BASICAMENTE ERA PARA DESCARGAR VIDEOS A MAXIMA CALIDAD (la libreria 'ytdl-core' no puede descargar buena calidad con el audio junto)

const getVideoAndAudio = (url, room, vid_name, callback) => {
    let video = ytdl(url, { quality: 'highestvideo' });
    let audio = ytdl(url, { quality: 'highestaudio' });

    fs.readdir(`public/rooms/${room}`, async (err, files) => {
        let video_id = await updateVideos(room, vid_name);
        if (err) fs.mkdir(`public/rooms/${room}`, (err) => {
            if (!err) {
                video.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp4`)).on('finish', () => {
                    audio.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp3`)).on('finish', () => {
                        console.log(`Video descargado para la sala ${room} | ${video_id}`);
                        playing(room, video_id);
                        return callback(false, `rooms/${room}/${video_id}`);
                    });
                });

            }
        });

        video.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp4`)).on('finish', () => {
            audio.pipe(fs.createWriteStream(`public/rooms/${room}/${video_id}.mp3`)).on('finish', () => {
                console.log(`Video descargado para la sala ${room} | ${video_id}`);
                playing(room, video_id);
                return callback(false, `rooms/${room}/${video_id}`);
            });
        });
    }
)};

export { getVideo, getVideoAndAudio };