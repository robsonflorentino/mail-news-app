var fs = require('fs'),
    path = require('path'),
	mime = require('mime');

exports.send = function upload(req, res){
	
  var list = [];	
  var idx = 0;
  var host = 'http://localhost:3000';
  
  // function to encode file data to base64 encoded string
  function base64_encode(file) {
	// read binary data
	var bitmap = fs.readFileSync(file);
	// convert binary data to base64 encoded string
	return new Buffer(bitmap).toString('base64');
  }
	
  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(name, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
  }
  
  walkSync('./app/public/img/upload', function(filePath, stat) {
    // do something with "filePath"...
	var mimeType = mime.lookup('/img/upload/'+filePath);
	var imagemBase64 = 'data:' + mimeType + ';base64,' + base64_encode('./app/public/img/upload/'+filePath)
	list.push({ "thumb": host+'/img/upload/'+filePath, "image": imagemBase64, "title": filePath, "id": ++idx  });
  });
  
  res.write(JSON.stringify(list));
  res.end();
}