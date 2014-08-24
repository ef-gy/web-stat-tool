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
      else
      {
         aggregate = parseFloat(aggregate);
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
        'tweets': tweets.count ? tweets.count : 0,
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
        'shares': facebookInteractions.shares ? facebookInteractions.shares : 0,
        'comments': facebookInteractions.comments ? facebookInteractions.comments : 0,
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
        'count': interactions.count ? interactions.count : 0,
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
        'views': interactions.result && interactions.result.views ? parseInt(interactions.result.views) : 0,
        'raw': interactions
      });
    });
  },

  getReddit : function (URL, statCallback) {
    this.fetchPage(http, 'http://buttons.reddit.com/button_info.json?url=' + encodeURIComponent(URL), function(body) {
      var interactions = JSON.parse(body);
      statCallback({
        'source': 'reddit.com',
        'url': URL,
        'score': interactions.data
              && interactions.data.children
              && interactions.data.children[0]
              && interactions.data.children[0].data
              && interactions.data.children[0].data.score
               ? interactions.data.children[0].data.score : 0,
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

    function process(data) {
      data.originalURL = URL;
      statCallback(data);
    }

    this.getGooglePlus(url.format(pURL), process);
    this.getTwitter(url.format(pURL), process);
    this.getFacebook(url.format(pURL), process);
    this.getLinkedin(url.format(pURL), process);
    this.getStumbleupon(url.format(pURL), process);
    this.getReddit(url.format(pURL), process);
    if (pURL.protocol == 'http:')
    {
      pURL.protocol = 'https:';
      this.getTwitter(url.format(pURL), process);
      this.getFacebook(url.format(pURL), process);
      this.getStumbleupon(url.format(pURL), process);
    }
    else if (pURL.protocol == 'https:')
    {
      pURL.protocol = 'http:';
      this.getTwitter(url.format(pURL), process);
      this.getFacebook(url.format(pURL), process);
      this.getStumbleupon(url.format(pURL), process);
    }
  },

  getSitemap : function (URL, statCallback) {
    if ((typeof URL) === 'object')
    {
      for (i in URL)
      {
        this.getSitemap(URL[i], statCallback);
      }
      return;
    }

    var pURL = url.parse(URL);
    var stats = this;
    var URLs = [];

    function process() {
      stats.getURLStatistics(URLs, statCallback);
      stats.getDomainStatistics(URLs, statCallback);
    }

    this.fetchPage(pURL.protocol == 'https:' ? https : http, url.format(pURL), function(body) {
      var $ = cheerio.load(body);

      $('url').each(function(i,element) {
        statCallback({
         'source': URL,
         'url': $('loc', this).text(),
         'lastModified': $('lastmod', this).text()
        });
        URLs.push($('loc', this).text());
      });

      process();
    });
  },

  getSitemapAggregate : function (URL, statCallback) {
    var urls = {};
    var domains = {};

    function process (data) {
      if (data.originalURL) {
        if (!urls[data.originalURL]) {
          urls[data.originalURL] = {
            'total': 0,
            'twitter': 0,
            'facebook': 0,
            'googleplus': 0,
            'linkedin': 0,
            'stumbleupon': 0,
            'reddit': 0
          };
        }

        if (data.source == 'twitter.com')
        {
          urls[data.originalURL].total += data.tweets;
          urls[data.originalURL].twitter += data.tweets;
        }
        else if (data.source == 'facebook.com')
        {
          urls[data.originalURL].total += data.shares + data.comments;
          urls[data.originalURL].facebook += data.shares + data.comments;
        }
        else if (data.source == 'google.com/+')
        {
          urls[data.originalURL].total += data.aggregateCount;
          urls[data.originalURL].googleplus += data.aggregateCount;
        }
        else if (data.source == 'linkedin.com')
        {
          urls[data.originalURL].total += data.count;
          urls[data.originalURL].linkedin += data.count;
        }
        else if (data.source == 'stumbleupon.com')
        {
          urls[data.originalURL].total += data.views;
          urls[data.originalURL].stumbleupon += data.views;
        }
        else if (data.source == 'reddit.com')
        {
          urls[data.originalURL].total += data.score;
          urls[data.originalURL].reddit += data.score;
        }
      }
      else if (data.domain) {
        if (!domains[data.domain]) {
          domains[data.domain] = {
            'alexaRank': null
          };
        }

        if (data.source == 'alexa.com')
        {
          domains[data.domain].alexaRank = data.rank.global;
        }
      }

      statCallback(urls, domains);
    }

    this.getSitemap(URL, process);
  }
}

var _urls = {};
var _domains = {};

wst.getSitemapAggregate(process.argv.slice(2), function(urls, domains) {
  _urls = urls;
  _domains = domains;
});

process.on('exit', function(code) {
  for (i in _urls) {
    if (_urls[i].total == 0) {
      delete _urls[i];
    }
  }

  console.log(JSON.stringify({'urls': _urls, 'domains': _domains}));
});
