var http = require('http');
var cheerio = require('cheerio');
var page = process.argv[2];

function getAlexaRank (domain, statCallback)
{
  http.get('http://www.alexa.com/siteinfo/' + encodeURIComponent(domain), function(r) {
    var body = '';

    r.on('data', function (chunk) {
      body += chunk;
    });

    r.on('end', function () {
      var $ = cheerio.load(body);

      statCallback({
        'source': 'alexa.com',
        'rank':
        {
          'global': $('[data-cat=globalRank] .metrics-data').text(),
          'country': $('[data-cat=countryRank] .metrics-data').text()
        },
        'bounceRate': $('[data-cat=bounce_percent] .metrics-data').text(),
        'dailyPageviewsPerVisitor': $('[data-cat=pageviews_per_visitor] .metrics-data').text(),
        'dailyTimeOnSite': $('[data-cat=time_on_site] .metrics-data').text(),
        'searchVisits': $('[data-cat=search_percent] .metrics-data').text()
      });
    });
  });
}

getAlexaRank(process.argv[2], console.log);
