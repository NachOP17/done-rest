const validator = require('validator');

var Errores = {
  correcto: 0,
  usuarioIncorrecto: '1',
  passwordIncorrecta: '2',
  usuarioBloqueado: '3',
  usuarioExistente: '4',
  correoExistente: '5',
  correoNoIngresado: '6',
  correoNoValido: '7',

  validarErroresRegistro
}

function validarErroresRegistro(e) {
  var errores = [];
  if (e.code == 11000) {
    if (validator.contains(e.errmsg, '@')) {
      errores.push(Errores.correoExistente);
    } else {
      errores.push(Errores.usuarioExistente);
    }
  }

  var campoDeError = JSON.stringify(e.errors);
  //if (validator.contains(campoDeError, 'email')) {

  //}
  return errores;
}

module.exports = {
  Errores,
  validarErroresRegistro
};
