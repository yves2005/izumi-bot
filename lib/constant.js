const sharp = require('sharp');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');

const genThumbnail = async (filePath) => {
    const thumbnailBuffer = await sharp(filePath).resize(64).jpeg({ quality: 60 }).toBuffer();
    return thumbnailBuffer.toString('base64');
};

exports.genThumbnail = genThumbnail;

async function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            }
            const duration = metadata?.format?.duration;
            resolve(duration || undefined);
        });
    });
}

exports.extractVideoThumb = (videoBuffer) => new Promise(async (resolve, reject) => {
    const videoFilePath = `./${Date.now()}.mp4`;
    fs.writeFileSync(videoFilePath, videoBuffer);

    const thumbnailFilePath = `${videoFilePath}.jpg`;
    const ffmpegCommand = `ffmpeg -ss 00:00:00 -i ${videoFilePath} -vframes 1 ${thumbnailFilePath}`;
    const videoDuration = await getVideoDuration(videoFilePath);

    exec(ffmpegCommand, async (err) => {
        if (err) {
            reject(err);
        } else {
            resolve({
                duration: videoDuration,
                thumbnail: await genThumbnail(fs.readFileSync(thumbnailFilePath))
            });
            fs.unlinkSync(videoFilePath);
            fs.unlinkSync(thumbnailFilePath);
        }
    });
});
