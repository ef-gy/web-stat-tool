#!/usr/bin/env nodejs

var webstats = require('../lib/webstats');

var _urls = {};
var _domains = {};

webstats.getSitemapAggregate(process.argv.slice(2), function(urls, domains) {
  _urls = urls;
  _domains = domains;
});

process.on('exit', function(code) {
  var out = '<social xmlns="https://github.com/ef-gy/web-stat-tool">';

  for (i in _urls) {
    if (_urls[i].total > 0) {
      var e = _urls[i];
      out += '<url id="' + i +
             '" total="' + e.total +
             '" twitter="' + e.twitter +
             '" facebook="' + e.facebook +
             '" google-plus="' + e.googleplus +
             '" reddit="' + e.reddit +
             '" stumbleupon="' + e.stumbleupon +
             '" linkedin="' + e.linkedin
           + '"/>';
    }
  }

  for (i in _domains)
  {
    out += '<domain id="' + i + '" alexa-rank="' + _domains[i].alexaRank + '"/>';
  }

  out += '</social>';

  console.log(out);
});
