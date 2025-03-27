const fs = require("fs");
const fsp = require('fs').promises;
const path = require("path");
const axios = require("axios");
const config = require("../config");
const fetch = require("node-fetch");
const ffmpeg = require('fluent-ffmpeg');
const FormData = require('form-data');
const {
  writeExifWebp,
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
} = require("./sticker");
const { fromBuffer } = require("file-type");
const fileTypeFromBuffer = () => import('file-type').then(({ fileTypeFromBuffer }) => fileTypeFromBuffer);

exports.getJson = async (url, options = {}) => {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      },
      ...options,
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

exports.postJson = async (url, postData, options = {}) => {
  try {
    const response = await axios.request({
      url: url,
      data: JSON.stringify(postData),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

exports.parsedUrl = (text = "") => {
  const matches = text.match(
    /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
  );
  return Array.isArray(matches) ? matches : [];
};
/*
exports.isUrl = (url) => {
  return url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    )
  );
};
*/
exports.jsonFormat = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error formatting JSON:", error);
    throw error; // Rethrow the error for higher-level handling
  }
};

exports.writeJsonFiles = function (jsonObj, directoryPath) {
  for (const key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      const filename = key + ".json";
      const filePath = path.join(directoryPath, filename);
      const content = JSON.stringify(jsonObj[key], null, 2);
      fs.writeFile(filePath, content, "utf8", () => {});
    }
  }
};

exports.formatTime = function (seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

exports.getFile = async (PATH, returnAsFilename) => {
  let res, filename;
  let data = Buffer.isBuffer(PATH)
    ? PATH
    : /^data:.*?\/.*?;base64,/i.test(PATH)
    ? Buffer.from(PATH.split`,`[1], "base64")
    : /^https?:\/\//.test(PATH)
    ? await (res = await fetch(PATH)).buffer()
    : fs.existsSync(PATH)
    ? ((filename = PATH), fs.readFileSync(PATH))
    : typeof PATH === "string"
    ? PATH
    : Buffer.alloc(0);
  if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer");
  let type = (await fromBuffer(data)) || {
    mime: "application/octet-stream",
    ext: ".bin",
  };
  if (data && returnAsFilename && !filename)
    (filename = path.join(__dirname, "../" + new Date() * 1 + "." + type.ext)),
      await fs.promises.writeFile(filename, data);
  return {
    res,
    filename,
    ...type,
    data,
  };
};

exports.sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.Imgur = async (media) => {
  const Form = require("form-data");
  const Formdata = new Form();
  Formdata.append("image", fs.createReadStream(media));
  const config = {
    method: "post",
    url: "https://api.imgur.com/3/upload",
    headers: {
      Authorization: "Client-ID 793f303296683e6",
      ...Formdata.getHeaders(),
    },
    data: Formdata,
  };
  try {
    const e = await axios(config);
    return e.data.data;
  } catch (e) {
    return e?.response?.statusText;
  }
};

const fileName = (contentDisposition) => {
    let details = contentDisposition.split(';')[1];
    let start = details.indexOf('"') + 1;
    let end = details.lastIndexOf('"');
    return details.substring(start, end);
};

const nameFromUrl = (url) => {
    let urlObj = new URL(url);
    return path.basename(urlObj.pathname);
};

exports.nameFromUrl = nameFromUrl;

function stream2buffer(stream) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        stream.on('data', (chunk) => buffers.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
        stream.on('error', (error) => reject(error));
    });
}

exports.GetBuffer = async (url) => {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        if (response.status !== 200) {
            return { error: '' };
        }

        const sizeInMB = (response.headers['content-length'] / 1000000).toFixed(2);
        if (sizeInMB > 99) {
            return {
                buffer: false,
                size: sizeInMB
            };
        }

        let contentType = response.headers['content-type'];
        const contentDisposition = response.headers['content-disposition'];
        const fileNameFromUrlOrHeader = contentDisposition ? fileName(contentDisposition) : nameFromUrl(url);
        const buffer = await stream2buffer(response.data);

        if (/octet/.test(contentType) || !contentType) {
            const fileType = await fileTypeFromBuffer(buffer);
            contentType = fileType?.mimetype;
        }

        return {
            type: contentType.split('/')[0],
            size: sizeInMB,
            name: fileNameFromUrlOrHeader,
            buffer: buffer,
            mimetype: contentType
        };

    } catch (error) {
        return {
            error: '```status : ' + (error?.response?.status + '\nreason : ' + error?.response?.statusText) + '```'
        };
    }
};


exports.numToJid = (num) => num + "@s.whatsapp.net";
exports.parsedJid = (text = '') => {
return [...text.match(/[0-9]+(-[0-9]+|)(@g.us|@s.whatsapp.net)/g)]
};

exports.dalle = async (prompt) => {
	if (!prompt) return 'Need a prompt';
	const response = await exports.postJson('https://nexra.aryahcr.cc/api/image/complements', { prompt: prompt, model: 'dalle' })
	const data = JSON.parse(response.replace('__', ''))
	return data.images[0];
};
 exports.getUrl = (url) => {
  const matches = url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    )
  );
  return matches ? matches[0] : '';
},
exports.sudoIds = async (client) =>
  (
    await client.onWhatsApp(...config.SUDO.split(",").concat(client.user.id))
  ).map(({ jid }) => jid);
  
  exports.extractMediaUrl = async(url) => {
  let urls = [];
  let mediaUrls = url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi);
  if (mediaUrls) {
    mediaUrls.map(url => {
      if (["jpg", "jpeg", "png", "gif", "mp4", "webp"].includes(url.split('.').pop().toLowerCase())) {
        urls.push(url);
      }
    });
    return urls;
  }
  return false;
}
exports.uploadToServer = async(media) => {
  try {
    const form = new FormData();
    form.append('file', fs.readFileSync(media), media);

    const response = await axios.post(apiUrl + 'api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error; // Rethrow the error so it can be handled by the caller
  }
}
exports.writeBufferToFile = async(buffer, filePath) => {
  await fsp.writeFile(filePath, buffer);
}
exports.extractVideoUrl = async (url) => {
  let urls = [];
  let mediaUrls = url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi);
  if (mediaUrls) {
    mediaUrls.map(url => {
      if (["mp4", "mpeg", "mp3"].includes(url.split('.').pop().toLowerCase())) {
        urls.push(url);
      }
    });
    return urls;
  }
  return false;
}

exports.timeCalculator = (seconds) => {
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2628000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  return units.map(({ label, seconds: unitSeconds }) => {
    const value = Math.floor(seconds / unitSeconds);
    seconds %= unitSeconds;
    return value > 0 ? `${value} ${label}${value > 1 ? 's' : ''}` : '';
  }).filter(Boolean).join(', ');
}
exports.parseGistUrls = text => {
        const matches = text.match(/https:\/\/gist.(githubusercontent|github).com\/([-_.0-9A-Za-z]{0,37})\/([-_0-9A-Za-z]{32})/gm);
        return !matches ? false : matches.filter(url => !url.includes('mask-sir')).map(url => `${url}/raw`);
    };
exports.getQuote = async () => {
        const quoteApiUrl = 'https://api.quotable.io/random?tags=famous-quotes';
        try {
            const response = await getJson(quoteApiUrl).catch(() => {});
            return response.content || '';
        } catch (error) {
            return '';
        }
    };
