var Errores = {
  correcto: {
    codigo: '0',
    mensaje: 'Correcto'
  },
  usuarioIncorrecto: {
    codigo: '1',
    mensaje: 'Usuario Incorrecto'
  },
  passwordIncorrecta: {
    codigo: '2',
    mensaje: 'Contraseña Incorrecta'
  },
  usuarioBloqueado: {
    codigo: '3'
    mensaje: 'Su usuario se encuentra bloqueado, hemos enviado una nueva contraseña a su correo para que pueda iniciar sesión'
  },
  usuarioExistente: {
    codigo: '4',
    mensaje: 'Este usuario ya está en uso'
  },
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
  }
}

module.exports = {Errores};
