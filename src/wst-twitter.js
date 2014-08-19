var http = require('http');
var page = process.argv[2];

http.get('http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(page), function(r) {
  var body = '';

  r.on('data', function (chunk) {
    body += chunk;
  });

  r.on('end', function () {
    var tweets = JSON.parse(body);
    console.log(tweets.count);
  });
});
