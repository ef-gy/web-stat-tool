var http = require('http');
var page = process.argv[2];

http.get('http://graph.facebook.com/?id=' + encodeURIComponent(page), function(r) {
  var body = '';

  r.on('data', function (chunk) {
    body += chunk;
  });

  r.on('end', function () {
    var facebookInteractions = JSON.parse(body);
    console.log(facebookInteractions.shares);
  });
});
