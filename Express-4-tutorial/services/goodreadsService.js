const axios = require('axios');
const xml2js = require('xml2js');
const debug = require('debug')('server:goodreadsService');

// without flag with wrap values in [arrays] of 1 el
const parser = xml2js.Parser({ explicitArray: false });

function goodreadsService() {
  function getBookById(id) {
    return new Promise((resolve, reject) => {
      axios
        .get(`https://www.goodreads.com/book/show/${id}.xml?key=EPQIHVTyQZbAdd33Qy2Htg`)
        .then((response) => {
          parser.parseString(response.data, (err, result) => {
            if (err) {
              debug(err);
            } else {
              // debug('AXIOS resp:', result);
              resolve(result.GoodreadsResponse.book);
            }
          });
        })
        .catch((error) => {
          debug(error);
          reject(error);
        });
    });
  }

  return { getBookById };
}

// Note we are executing it here:
module.exports = goodreadsService();
