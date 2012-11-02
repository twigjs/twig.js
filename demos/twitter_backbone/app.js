var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || process.env.PORT || 8888,
    host = process.argv[3] || process.env.IP || "0.0.0.0";

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(__dirname, uri);

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10), host);

console.log("Twig.Twitter demo running at\n => " + host + ":" + port + "/\nCTRL + C to shutdown");

