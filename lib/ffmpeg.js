const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { exec } = require('child_process');
const webp = require('node-webpmux');
const config = require('../config');
const fsExtra = require('fs-extra');
const { join } = require('path');
const sharp = require("sharp")

const [pname, pb] = config.STICKER_PACKNAME === 'false' ? [] : config.STICKER_PACKNAME.split(/[,;]/);
const deleteFile = (filePath) => {
  if (!filePath.includes('mention')) {
    fs.unlink(filePath, () => {});
  }
};
const addExif = async (imagePath, metadata = {}) => {
  const defaultMetadata = {
    packname: '',
    author: '',
    categories: [''],
    android: '',
    ios: ''
  };

  const finalMetadata = { ...defaultMetadata, ...metadata };

  if (finalMetadata.packname || finalMetadata.author) {
    const webpImage = new webp.Image();
    const exifData = {
      'sticker-pack-id': "github.com/sataniceepz/Izumi-v3",
      'sticker-pack-name': finalMetadata.packname,
      'sticker-pack-publisher': finalMetadata.author,
      'emojis': finalMetadata.categories,
      'android-app-store-link': finalMetadata.android,
      'ios-app-store-link': finalMetadata.ios
    };

    const exifHeader = Buffer.from([0x49, 0x49, 0x2a, 0x0, 0x8, 0x0, 0x0, 0x0, 0x1, 0x0, 0x41, 0x57, 0x7, 0x0, 0x0, 0x0, 0x0, 0x0, 0x16, 0x0, 0x0, 0x0]);
    const exifBody = Buffer.from(JSON.stringify(exifData), "utf-8");
    const exifBuffer = Buffer.concat([exifHeader, exifBody]);
    exifBuffer.writeUIntLE(exifBody.length, 0xe, 4);

    await webpImage.load(imagePath);
    webpImage.exif = exifBuffer;
    const outputPath = "exif.webp";
    await webpImage.save(outputPath);

    return outputPath;
  }
  return null;
};

exports.addExif = addExif;
const options = {
    'nonanimated': [
        '-y',
        '-vcodec libwebp',
        '-vf',
        'scale=2006:2006:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2006:2006:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
    ],
    'newnonanimated': [
        '-vcodec',
        'libwebp',
        '-vf',
        'crop=w=\'min(min(iw,ih),500)\':h=\'min(min(iw,ih),500)\',scale=2006:2006,setsar=1'
    ],
    'animated2': [
        '-y',
        '-vcodec libwebp',
        '-vf',
        'scale=1024:1024:flags=lanczos:force_original_aspect_ratio=decrease,fps=20,format=rgba,pad=1024:1024:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-lossless 1',
        '-qscale 1',
        '-preset default',
        '-loop 0',
        '-an',
        '-vsync 0',
        '-s 512x512'
    ],
    'animated1': [
        '-y',
        '-vcodec libwebp',
        '-vf',
        'scale=2006:2006:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2006:2006:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-lossless 1',
        '-preset default',
        '-loop 0',
        '-an',
        '-vsync 0',
        '-s 512x512'
    ],
    'newanimated1': [
        '-vcodec',
        'libwebp',
        '-vf',
        'crop=w=\'min(min(iw,ih),500)\':h=\'min(min(iw,ih),500)\',scale=500:500,setsar=1',
        '-loop',
        '0',
        '-lossless 1',
        '-qscale 1',
        '-preset',
        'default',
        '-an',
        '-vsync',
        '0',
        '-s',
        '512:512'
    ],
    'newanimated2': [
        '-vcodec',
        'libwebp',
        '-vf',
        'crop=w=\'min(min(iw,ih),500)\':h=\'min(min(iw,ih),500)\',scale=500:500,setsar=1,fps=20',
        '-loop',
        '0',
        '-lossless 1',
        '-qscale 1',
        '-preset',
        'default',
        '-an',
        '-vsync',
        '0',
        '-s',
        '512:512'
    ],
    'left': [
        '-vf',
        'transpose=2'
    ],
    'right': [
        '-vf',
        'transpose=1'
    ],
    'flip': [
        '-vf',
        'transpose=2,transpose=2'
    ],
    'videor': [
        '-y',
        '-vf',
        'reverse',
        '-af',
        'areverse'
    ],
    'audior': [
        '-y',
        '-af',
        'areverse'
    ],
    'compress': [
        '-vcodec',
        'libx264',
        '-crf',
        '28'
    ],
    'mp3': [
        '-map',
        '0:a'
    ],
    'tts': [
        '-codec:a',
        'libopus'
    ],
    'photo': [],
    'lowmp3': [
        '-y',
        '-af',
        'asetrate=44100*1.3'
    ],
    'avec': [
        '-y',
        '-filter_complex',
        '[0:a]avectorscope=s=720x1280:rf=5:gf=25:bf=5:draw=line,format=yuv420p[v]',
        '-map',
        '[v]',
        '-map 0:a'
    ],
    'pitch': [
        '-y',
        '-af',
        'asetrate=44100*0.9'
    ],
    'bass': [
        '-y',
        '-af',
        'bass=g=10'
    ],
    'treble': [
        '-y',
        '-af',
        'treble=g=10'
    ],
    'histo': [
        '-filter_complex',
        ,
        '[0:a]ahistogram=s=hd480:slide=scroll:scale=log,format=yuv420p[v]',
        '-map',
        '[v]',
        '-map',
        '0:a',
        '-b:a',
        '360k'
    ],
    'vector': [
        '-filter_complex',
        '[0:a]avectorscope=s=512x512:zoom=1.5:rc=0:gc=200:bc=0:rf=0:gf=40:bf=0,format=yuv420p[v]',
        '-map',
        '[v]',
        '-map',
        '0:a',
        '-b:v',
        '700k',
        '-b:a',
        '360k'
    ],
    'crop': [
        '-y',
        '-vf',
        'crop=cw:ch:w:h'
    ]
};

exports.getFfmpegBuffer = (inputPath, outputPath, filterName) => {
    let bassLevel = 'false', trebleLevel = 'false';
    if (/bass,/.test(filterName)) {
        bassLevel = filterName.split(',')[1];
        filterName = filterName.split(',')[0];
    }
    if (/treble,/.test(filterName)) {
        trebleLevel = filterName.split(',')[1];
        filterName = filterName.split(',')[0];
    }

    let filters = options[filterName];
    if (bassLevel !== 'false') {
        filters[2] = 'bass=g=' + bassLevel;
    }
    if (trebleLevel !== 'false') {
        filters[2] = 'treble=g=' + trebleLevel;
    }

    return new Promise(function (resolve, reject) {
        ffmpeg(inputPath)
            .outputOptions(filters)
            .save(outputPath)
            .on('error', err => reject(new Error(err.message)))
            .on('end', async () => {
                const buffer = fs.readFileSync(outputPath);
                resolve(buffer);
            });
    }).catch(err => console.log(err));
};

const getMediaInfo = (filePath) => {
    return new Promise(resolve => {
        ffmpeg.ffprobe(filePath, (err, info) => {
            resolve(info);
        });
    });
};

exports.cropsticker = (outputPath, inputPath, type = 1, emoji = '\uD83E\uDD70') => {
    let filters = options.newnonanimated;
    if (type === 2) {
        filters = options.newanimated1;
    }
    if (type === 3) {
        filters = options.newanimated2;
    }

    return new Promise(function (resolve, reject) {
        ffmpeg(inputPath)
            .outputOptions(filters)
            .save(outputPath + 'c.webp')
            .on('error', err => reject(new Error(err.message)))
            .on('end', async () => {
                const buffer = await addExif(outputPath + 'c.webp', undefined, undefined, [emoji]).catch(err => new Error(err.message));
                resolve(buffer);
            });
    });
};

exports.sticker = (outputPath, inputPath, type = 1, emoji = '\uD83E\uDD70') => {
    let filters = options.nonanimated;
    if (type === 2) {
        filters = options.animated2;
    }
    if (type === 3) {
        filters = options.animated1;
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions(filters)
            .save(outputPath + '.webp')
            .on('error', err => reject(new Error(err.message)))
            .on('end', async () => {
                const buffer = await addExif(fs.readFileSync(outputPath + '.webp'), undefined, undefined, [emoji]).catch(err => new Error(err.message));
                resolve(buffer);
            });
    });
};


exports.audioCut = (inputPath, startTime, duration, outputName = 'cut') => {
    return new Promise(function (resolve, reject) {
        ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .save(outputName + '.mp3')
            .on('error', err => reject(new Error(err.message)))
            .on('end', async () => {
                const buffer = fs.readFileSync(outputName + '.mp3');
                resolve(buffer);
            });
    });
};

exports.avm = (mediaFiles) => {
    mediaFiles = mediaFiles.reverse();
    return new Promise(function (resolve, reject) {
        let ffmpegCommand = ffmpeg();
        mediaFiles.forEach(file => ffmpegCommand.input(join(__dirname, '../media/avm/' + file)));

        ffmpegCommand.outputOptions([
            '-map', '0:v',
            '-map', '1:a',
            '-c:v', 'copy',
            '-shortest'
        ]);

        ffmpegCommand.save('audvid.mp4');

        ffmpegCommand.on('error', err => reject(new Error(err.message)));
        ffmpegCommand.on('end', () => {
            fsExtra.emptyDirSync(join(__dirname, '../media/avm'));
            resolve(fs.readFileSync('audvid.mp4'));
        });
    });
};

exports.videoHeightWidth = async (filePath) => {
    const { streams } = await getMediaInfo(filePath);
    return {
        'width': streams[0].width,
        'height': streams[0].height
    };
};

exports.videoTrim = (inputPath, startTime, duration) => {
    return new Promise(function (resolve, reject) {
        ffmpeg(inputPath)
            .setStartTime(startTime.trim())
            .setDuration(duration.trim())
            .withVideoCodec('copy')
            .withAudioCodec('copy')
            .on('error', err => reject(new Error(err.message)))
            .save('videotrim.mp4')
            .on('end', async () => {
                let buffer = fs.readFileSync('videotrim.mp4');
                resolve(buffer);
            });
    });
};

exports.mergeVideo = (numVideos) => {
    return new Promise(function (resolve, reject) {
        let listContent = '', i = 1;
        while (i <= numVideos) {
            listContent += 'file \'./media/merge/' + i + '.mp4\'\n';
            i++;
        }
        fs.writeFileSync('video.txt', listContent);

        exec('ffmpeg -f concat -safe 0 -i video.txt -c copy merge.mp4', err => {
            if (err) {
                reject(new Error('mergeVideo failed'));
            } else {
                fsExtra.emptyDirSync('./media/merge');
                let buffer = fs.readFileSync('merge.mp4');
                resolve(buffer);
            }
        });
    });
};

exports.blackVideo = (audioPath) => {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -y -i ' + audioPath + ' toblack.aac', (err) => {
      if (err) {
        return reject(new Error('black failed during audio extraction: ' + err.message));
      }

      exec(
        'ffmpeg -y -loop 1 -framerate 1 -i ' +
          join(__dirname, '../media/black.jpg') +
          ' -i toblack.aac -map 0 -map 1:a -c:v libx264 -preset ultrafast -profile:v baseline -tune stillimage -vf "scale=\'min(360,iw)\':-2,format=yuv420p" -c:a copy -shortest black.mp4',
        (err) => {
          if (err) {
            return reject(new Error('black failed during video creation: ' + err.message));
          } else {
            const buffer = fs.readFileSync('black.mp4');
            resolve(buffer);
          }
        }
      );
    });
  });
};
exports.cropVideo = (inputPath, width, height, x, y) => {
    return new Promise(function (resolve, reject) {
        exec('ffmpeg -y -i ' + inputPath + ' -vf "crop=' + width + ':' + height + ':' + x + ':' + y + '" -c:v libx264 -crf 1 -c:a copy croped.mp4', err => {
            if (err) {
                reject(new Error('crop failed'));
            } else {
                const buffer = fs.readFileSync('croped.mp4');
                resolve(buffer);
            }
        });
    });
};
exports.circleSticker = async (input, isVideo) => {
  const data = isVideo ? await exports.videoToGif(input) : fs.readFileSync(input);
  deleteFile(input);

  const svgBuffer = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="256" fill="rgba(0, 0, 0, 0)"/>
      </svg>
  `);

  const options = {
      quality: 100,
      lossless: false
  };

  const circleImage = await sharp(data)
      .resize(512, 512, { fit: 'cover' })
      .composite([{ input: svgBuffer, blend: 'dest-in' }])
      .webp(options)
      .toBuffer();

  const exifFilePath = await exports.addExif(circleImage, { packname: 'Your Packname', author: 'Your Author' });

  if (exifFilePath) {
    return fs.createReadStream(exifFilePath);
  } else {
    throw new Error('Failed to add EXIF');
  }
};
