var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
var url = require('url');

var wst = {
  fetchPage : function (http, URL, pageCallback) {
    http.get(URL, function(r) {
      var body = '';

      r.on('data', function (chunk) {
        body += chunk;
      });

      r.on('end', function () {
        pageCallback(body);
      });
    });
  },

  getAlexa : function (domain, statCallback) {
    this.fetchPage(http, 'http://www.alexa.com/siteinfo/' + encodeURIComponent(domain), function(body) {
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
  },

  getGooglePlus : function (URL, statCallback) {
    this.fetchPage(https, 'https://plusone.google.com/_/+1/fastbutton?url=' + encodeURIComponent(URL), function(body) {
      var $ = cheerio.load(body);
      var aggregate = $('#aggregateCount').text();

      if (aggregate.match(/B$/)) // kinda doubt they actually do that one, but meh.
      {
         aggregate = parseFloat(aggregate) * 1e9;
      }
      else if (aggregate.match(/M$/))
      {
         aggregate = parseFloat(aggregate) * 1e6;
      }
      else if (aggregate.match(/B$/))
      {
         aggregate = parseFloat(aggregate) * 1e3;
      }

      statCallback({
        'source': 'google.com/+',
        'url': URL,
        'aggregateCount': aggregate
      });
    });
  },

  getTwitter : function (URL, statCallback) {
    this.fetchPage(http, 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(URL), function(body) {
      var tweets = JSON.parse(body);
      statCallback({
        'source': 'twitter.com',
        'url': URL,
        'tweets': tweets.count,
        'raw': tweets
      });
    });
  },

  getFacebook : function (URL, statCallback) {
    this.fetchPage(http, 'http://graph.facebook.com/?id=' + encodeURIComponent(URL), function(body) {
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
  },

  getLinkedin : function (URL, statCallback) {
    this.fetchPage(http, 'http://www.linkedin.com/countserv/count/share?format=json&url=' + encodeURIComponent(URL), function(body) {
      var interactions = JSON.parse(body);
      statCallback({
        'source': 'linkedin.com',
        'url': URL,
        'count': interactions.count,
        'raw': interactions
      });
    });
  },

  getStumbleupon : function (URL, statCallback) {
    this.fetchPage(http, 'http://www.stumbleupon.com/services/1.01/badge.getinfo?url=' + encodeURIComponent(URL), function(body) {
      var interactions = JSON.parse(body);
      statCallback({
        'source': 'stumbleupon.com',
        'url': URL,
        'views': interactions.result.views,
        'raw': interactions
      });
    });
  },

  getDomainStatistics : function (URL, statCallback) {
    if ((typeof URL) === 'object')
    {
      var testedDomains = [];
      for (i in URL)
      {
        var pURL = url.parse(URL[i]);
        var domain = pURL.host.replace(/([^.]+\.)*([^.]+\.[^.]+)$/,'$2');

        if (testedDomains.indexOf(domain) == -1)
        {
          testedDomains.push(domain);
          this.getDomainStatistics(domain, statCallback);
        }
      }
      return;
    }

    this.getAlexa(URL, statCallback);
  },

  getURLStatistics : function (URL, statCallback) {
    if ((typeof URL) === 'object')
    {
      for (i in URL)
      {
        this.getURLStatistics(URL[i], statCallback);
      }
      return;
    }

    var pURL = url.parse(URL);

    this.getGooglePlus(url.format(pURL), statCallback);
    this.getTwitter(url.format(pURL), statCallback);
    this.getFacebook(url.format(pURL), statCallback);
    this.getLinkedin(url.format(pURL), statCallback);
    this.getStumbleupon(url.format(pURL), statCallback);
    if (pURL.protocol == 'http:')
    {
      pURL.protocol = 'https:';
      this.getTwitter(url.format(pURL), statCallback);
      this.getFacebook(url.format(pURL), statCallback);
      this.getStumbleupon(url.format(pURL), statCallback);
    }
    else if (pURL.protocol == 'https:')
    {
      pURL.protocol = 'http:';
      this.getTwitter(url.format(pURL), statCallback);
      this.getFacebook(url.format(pURL), statCallback);
      this.getStumbleupon(url.format(pURL), statCallback);
    }
  },

  getSitemap : function (URL, statCallback) {
  }
}

wst.getURLStatistics(process.argv.slice(2), console.log);
wst.getDomainStatistics(process.argv.slice(2), console.log);
