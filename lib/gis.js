const axios = require('axios');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
const REGEX = /\["(http.+?)",(\d+),(\d+)\]/g;

async function gis(searchTerm, options = {}) {
  if (!searchTerm || typeof searchTerm !== 'string')
    throw new TypeError("searchTerm must be a string.");

  if (typeof options !== 'object')
    throw new TypeError("options argument must be an object.");

  const {
    query = {},
    filterOutDomains = ['gstatic.com'],
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    disableDoubleHTTP = true,
    safeSearch = true // Add SafeSearch parameter
  } = options;

  if (safeSearch) {
    query.safe = 'active';
  }

  const searchUrl = `http://www.google.com/search?${new URLSearchParams({ ...query, tbm: "isch", q: searchTerm })}`;

  const response = await axios.get(searchUrl, {
    headers: {
      'User-Agent': userAgent
    }
  });

  const body = response.data;

  const results = [];

  let result;

  while ((result = REGEX.exec(body)) !== null) {
    if (result.length > 3 && filterOutDomains.every(skipDomain => !result[1].includes(skipDomain))) {
      results.push({
        url: disableDoubleHTTP ? `http${result[1].split("http")[1]}` : result[1],
        height: +result[2],
        width: +result[3]
      });
    }
  }

  return results;
}

module.exports = gis;