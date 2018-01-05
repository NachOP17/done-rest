const nodemailer = require('nodemailer');
var {Usuario} = require('./modelos/usuario');

var Mailer = {
  enviarCorreo,
  generateRandomPassword
}

function enviarCorreo(to, id) {

  //console.log('El correo se está enviando');

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pruebadoneapp@gmail.com',
      pass: 'ucab12345'
    }
  });

  var mailOptions = {
    from: 'pruebadoneapp@gmail.com',
    to: to,
    subject: 'Cuenta de Done bloqueada',
    html: '<p>Su cuenta ha sido bloqueada por seguridad. Hemos generado la siguiente contraseña' +
    ' para que pueda iniciar sesión: <b><i>' + generateRandomPassword(id) + '</b></i>. <br /> ' +
    'Le recomendamos cambiar contraseña al iniciar sesión'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log();
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function generateRandomPassword(id) {
  var pass = Math.random().toString(36).slice(-8);
  // console.log(pass);
  Usuario.findByIdAndUpdate(id, {
    $set: {
      password: Usuario.encrypt(pass)
    }
  }, {new: true}).then((usuario) => console.log());
  return pass;
}


module.exports = {Mailer}
