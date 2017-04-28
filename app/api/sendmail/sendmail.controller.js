var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    PropertiesReader = require('properties-reader'),
    path = require('path'),
    htmlToPdf = require('html-to-pdf'),
	pdf = require('html-pdf'),
	inlineBase64 = require('nodemailer-plugin-inline-base64');

var properties = PropertiesReader(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.primoinvestment/.primoconfig'));

var transporterWithAuth = nodemailer.createTransport(smtpTransport({
  host: properties.get('smtp.host'),
  port: properties.get('smtp.port'),
  auth: {
    user: properties.get('smtp.user'),
    pass: properties.get('smtp.pass')
  },
  tls: {
    rejectUnauthorized:false
  }
}));

var transporterWithoutAuth = nodemailer.createTransport(smtpTransport({
  host: properties.get('smtp.host'),
  port: properties.get('smtp.port'),
  tls: {
    rejectUnauthorized:false
  }
}));

exports.send = function(req,res){

  debugger;

  var mailOptions = {
	secureConnection: true,
	transportMethod: 'SMTP',
    to: properties.get('mail.to'),
    subject: properties.get('mail.subject') + ' ' + getDate(),
    from: properties.get('mail.from'),
    html: req.body.data
  };
  
  var newsPath = path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.primoinvestment/news');
  
  var pdfFile = newsPath + '/' + (properties.get('mail.subject') + ' ' + getDate('_')) + '.pdf';

  function getDate(divider){
    
    if(divider == null)
      divider = '/'
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
      dd='0'+dd
    }
    if(mm<10){
      mm='0'+mm
    }

    return mm + divider + dd + divider + yyyy;
  }

  
  var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html>' + req.body.data + '</html>'; 
  
  var options = { format: 'Letter' };
 
  pdf.create(html, options).toFile(pdfFile, function(error, success) {
	if (error) {
        res.send({'error': true, 'message': error.message});
        console.log(err);
      } else {
        //res.send({'error': false, 'message': 'Arquivo pdf gerado com sucesso'});
        
        if(properties.get('smtp.auth')) {
          
          console.log('executando envio com autenticação.');
          
		  transporterWithAuth.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));
		  
          transporterWithAuth.sendMail(mailOptions, function(error, info){
            if (error) {
              res.send({'error': true, 'message': error.message});
              console.log(error);
            } else {
              res.send({'error': false, 'message': 'Mensagem enviada com sucesso!'})
            }
          });
        } else {
          
          console.log('executando envio sem autenticação.');
          
		  transporterWithoutAuth.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));
		  
          transporterWithoutAuth.sendMail(mailOptions, function(error, info){
            if (error) {
              res.send({'error': true, 'message': error.message});
              console.log(error);
            } else {
              res.send({'error': false, 'message': 'Mensagem enviada com sucesso!'})
            }
          });
        }
      }
  });
}
