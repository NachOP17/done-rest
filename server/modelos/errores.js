const validator = require('validator');

var Errores = {
  correcto: {
    codigo: '0',
    mensaje: 'Correcto'
  },

  // Errores del Correo
  correoExistente: {
    codigo: '5',
    mensaje: 'Este correo ya está en uso'
  },
  correoNoIngresado: {
    codigo: '6',
    mensaje: 'El campo de correo no puede estar vacío'
  },
  correoNoValido: {
    codigo: '7',
    mensaje: 'El correo no es válido'
  },
  correoMuyCorto: {
    codigo: '8',
    mensaje: 'El correo es muy corto (Mínimo 1 caracter)'
  },
  correoMuyLargo: {
    codigo: '9',
    mensaje: 'El correo es muy largo (Máximo 50 caracteres)'
  },

  // Errores del Usuario
  usuarioIncorrecto: {
    codigo: '1',
    mensaje: 'Usuario Incorrecto'
  },
  usuarioBloqueado: {
    codigo: '3',
    mensaje: 'Su usuario se encuentra bloqueado, hemos enviado una nueva contraseña a su correo para que pueda iniciar sesión'
  },
  usuarioExistente: {
    codigo: '4',
    mensaje: 'Este usuario ya está en uso'
  },
  usuarioNoIngresado: {
    codigo: '10',
    mensaje: 'El campo de nombre de usuario no puede estar vacío'
  },
  usuarioMuyCorto: {
    codigo: '11',
    mensaje: 'El nombre de usuario es muy corto (Mínimo 1 caracter)'
  },
  usuarioMuyLargo: {
    codigo: '12',
    mensaje: 'El nombre de usuario es muy largo (Máximo 20 caracteres)'
  },

  // Errores de la contraseña
  passwordIncorrecta: {
    codigo: '2',
    mensaje: 'Contraseña Incorrecta'
  },
  pwdNoIngresada: {
    codigo: '13',
    mensaje: 'El campo la contraseña no puede estar vacío'
  },
  pwdNoValida: {
    codigo: '14',
    mensaje: 'La contraseña solo puede contener caracteres alfanuméricos'
  },
  pwdMuyCorta: {
    codigo: '15',
    mensaje: 'La contraseña es muy corta (Mínimo 8 caracteres)'
  },
  pwdMuyLarga: {
    codigo: '16',
    mensaje: 'La contraseña es muy larga (Máximo 50 caracteres)'
  },

  // Errores del Nombre
  nombreNoIngresado: {
    codigo: '17',
    mensaje: 'El campo de nombre no puede estar vacío'
  },
  nombreMuyCorto: {
    codigo: '18',
    mensaje: 'El nombre es muy corto (Mínimo 1 caracter)'
  },
  nombreMuyLargo: {
    codigo: '19',
    mensaje: 'El nombre es muy largo (Máximo 50 caracteres)'
  },

  // Errores del apellido
  apellidoNoIngresado: {
    codigo: '20',
    mensaje: 'El campo de apellido no puede estar vacío'
  },
  apellidoMuyCorto: {
    codigo: '21',
    mensaje: 'El apellido es muy corto (Mínimo 1 caracter)'
  },
  apellidoMuyLargo: {
    codigo: '22',
    mensaje: 'El apellido es muy largo (Máximo 50 caracteres)'
  },

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

  var jsonDelError = JSON.stringify(e.errors);

  if (jsonDelError) {
    if (validator.contains(jsonDelError, 'email')) {
      switch(e.errors.email.kind) {
        case 'required': errores.push(Errores.correoNoIngresado);
          break;
        case 'user defined': errores.push(Errores.correoNoValido);
          break;
        case 'minlength': errores.push(Errores.correoMuyCorto);
          break
        case 'maxlength': errores.push(Errores.correoMuyLargo);
          break;
      }
    }

    if (validator.contains(jsonDelError, 'username')) {
      switch(e.errors.username.kind) {
        case 'required': errores.push(Errores.usuarioNoIngresado);
          break;
        case 'minlength': errores.push(Errores.usuarioMuyCorto);
          break
        case 'maxlength': errores.push(Errores.usuarioMuyLargo);
          break;
      }
    }

    if (validator.contains(jsonDelError, 'password')) {
      switch(e.errors.password.kind) {
        case 'required': errores.push(Errores.pwdNoIngresada);
          break;
        case 'user defined': errores.push(Errores.pwdNoValida);
          break;
        case 'minlength': errores.push(Errores.pwdMuyCorta);
          break
        case 'maxlength': errores.push(Errores.pwdMuyLarga);
          break;
      }
    }

    if (validator.contains(jsonDelError, 'nombre')) {
      switch(e.errors.nombre.kind) {
        case 'required': errores.push(Errores.nombreNoIngresado);
          break;
        case 'minlength': errores.push(Errores.nombreMuyCorto);
          break
        case 'maxlength': errores.push(Errores.nombreMuyLargo);
          break;
      }
    }

    if (validator.contains(jsonDelError, 'apellido')) {
      switch(e.errors.apellido.kind) {
        case 'required': errores.push(Errores.apellidoNoIngresado);
          break;
        case 'minlength': errores.push(Errores.apellidoMuyCorto);
          break
        case 'maxlength': errores.push(Errores.apellidoMuyLargo);
          break;
      }
    }
  }
  return errores;
}

module.exports = {Errores};
