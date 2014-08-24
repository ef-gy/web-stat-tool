var http = require('http');
var cheerio = require('cheerio');
var page = process.argv[2];

http.get('http://www.alexa.com/siteinfo/' + encodeURIComponent(page), function(r) {
  var body = '';

  r.on('data', function (chunk) {
    body += chunk;
  });

  r.on('end', function () {
    var $ = cheerio.load(body);
    console.log($);

    var alexaStats = {
      'source': 'alexa.com',
      'rank-global': $('[data-cat=globalRank] .metrics-data').text(),
      'rank-country': $('[data-cat=countryRank] .metrics-data').text()
    };

    console.log(alexaStats);
  });
});
