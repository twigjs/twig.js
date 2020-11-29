var exec = require('child_process').exec;
var cmd = 'twigjs --output compiled/ --pattern *.twig raw/';

exec(cmd, function(error, stdout, stderr) {
    console.log(stdout);
});