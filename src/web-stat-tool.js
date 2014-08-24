var http = require('http');
var cheerio = require('cheerio');
var url = require('url');

var wst = {
  getAlexa : function (domain, statCallback)
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
          'domain': domain,
          'rank':
          {
            'global': parseInt($('[data-cat=globalRank] .metrics-data').text().replace(/,/g,'')),
            'country': parseInt($('[data-cat=countryRank] .metrics-data').text())
          },
          'bounceRate': parseFloat($('[data-cat=bounce_percent] .metrics-data').text())/100,
          'dailyPageviewsPerVisitor': parseFloat($('[data-cat=pageviews_per_visitor] .metrics-data').text()),
          'dailyTimeOnSite': $('[data-cat=time_on_site] .metrics-data').text(),
          'searchVisits': parseFloat($('[data-cat=search_percent] .metrics-data').text())/100
        });
      });
    });
  },

  getTwitter : function (URL, statCallback) {
    http.get('http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(URL), function(r) {
      var body = '';

      r.on('data', function (chunk) {
        body += chunk;
      });

      r.on('end', function () {
        var tweets = JSON.parse(body);
        statCallback({
          'source': 'twitter.com',
          'url': URL,
          'tweets': tweets.count,
          'raw': tweets
        });
      });
    });
  },

  getFacebook : function (URL, statCallback) {
    http.get('http://graph.facebook.com/?id=' + encodeURIComponent(URL), function(r) {
      var body = '';

      r.on('data', function (chunk) {
        body += chunk;
      });

      r.on('end', function () {
        var facebookInteractions = JSON.parse(body);
        statCallback({
          'source': 'facebook.com',
          'url': URL,
          'shares': facebookInteractions.shares,
          'likes': facebookInteractions.likes,
          'comments': facebookInteractions.comments,
          'raw': facebookInteractions
        });
      });
    });
  },

  getURL : function (URL, statCallback) {
    var pURL = url.parse(URL);
    var domain = pURL.host.replace(/([^.]+\.)*([^.]+\.[^.]+)$/,'$2');

    this.getAlexa(domain, statCallback);
    this.getTwitter(url.format(pURL), statCallback);
    this.getFacebook(url.format(pURL), statCallback);
    if (pURL.protocol == 'http:')
    {
      pURL.protocol = 'https:';
      this.getTwitter(url.format(pURL), statCallback);
      this.getFacebook(url.format(pURL), statCallback);
    }
    else if (pURL.protocol == 'https:')
    {
      pURL.protocol = 'http:';
      this.getTwitter(url.format(pURL), statCallback);
      this.getFacebook(url.format(pURL), statCallback);
    }
  }
}

wst.getURL(process.argv[2], console.log);
