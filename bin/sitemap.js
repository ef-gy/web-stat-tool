#!/usr/bin/env nodejs

var webstats = require('../lib/webstats');

var _urls = {};
var _domains = {};

webstats.getSitemapAggregate(process.argv.slice(2), function(urls, domains) {
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
