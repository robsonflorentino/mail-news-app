var fs = require('fs'),
    path = require('path');

exports.send = function upload(req, res){
	
  var list = [];	
  var idx = 0;
	
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
	console.log(stat);
	list.push({ "thumb": '/img/upload/'+filePath, "url": '/img/upload/'+filePath, "title": filePath, "id": ++idx  });
  });
  
  console.log(JSON.stringify(list));
  
  res.write(JSON.stringify(list));
  res.end();
}