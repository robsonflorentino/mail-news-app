var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    PropertiesReader = require('properties-reader'),
    path = require('path'),
    htmlToPdf = require('html-to-pdf');

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

  var mailOptions = {
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
  
  htmlToPdf.setDebug(true);
  htmlToPdf.setInputEncoding('UTF-8');
  htmlToPdf.setOutputEncoding('UTF-8');
  htmlToPdf.convertHTMLString(req.body.data, pdfFile, function (error, success) {
    
      if (error) {
        res.send({'error': true, 'message': error.message});
        console.log(err);
      } else {
        res.send({'success': false, 'message': 'Arquivo pdf gerado com sucesso'});
        
        debugger;
        
        if(properties.get('smtp.auth')) {
          
          console.log('executando envio com autenticação.');
          
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
    }
  );
}
