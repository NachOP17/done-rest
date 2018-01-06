const validator = require('validator');
const {ObjectId} = require('mongodb');

var Errores = {
  correcto: {
    codigo: 0,
    mensaje: 'Correcto'
  },

  // Errores del Correo
  correoExistente: {
    codigo: 5,
    mensaje: 'Este correo ya está en uso'
  },
  correoNoIngresado: {
    codigo: 6,
    mensaje: 'El campo de correo no puede estar vacío'
  },
  correoNoValido: {
    codigo: 7,
    mensaje: 'El correo no es válido'
  },
  correoMuyCorto: {
    codigo: 8,
    mensaje: 'El correo es muy corto (Mínimo 1 caracter)'
  },
  correoMuyLargo: {
    codigo: 9,
    mensaje: 'El correo es muy largo (Máximo 50 caracteres)'
  },
  correoNoExiste: {
    codigo: 42,
    mensaje: 'EL correo ingresado no se encuentra registrado'
  },

  // Errores del Usuario
  usuarioIncorrecto: {
    codigo: 1,
    mensaje: 'Usuario Incorrecto'
  },
  usuarioBloqueado: {
    codigo: 3,
    mensaje: 'Su usuario se encuentra bloqueado, hemos enviado una nueva contraseña a su correo para que pueda iniciar sesión'
  },
  usuarioExistente: {
    codigo: 4,
    mensaje: 'Este usuario ya está en uso'
  },
  usuarioNoIngresado: {
    codigo: 10,
    mensaje: 'El campo de nombre de usuario no puede estar vacío'
  },
  usuarioMuyCorto: {
    codigo: 11,
    mensaje: 'El nombre de usuario es muy corto (Mínimo 1 caracter)'
  },
  usuarioMuyLargo: {
    codigo: 12,
    mensaje: 'El nombre de usuario es muy largo (Máximo 20 caracteres)'
  },

  // Errores de la contraseña
  passwordIncorrecta: {
    codigo: 2,
    mensaje: 'Contraseña Incorrecta'
  },
  pwdNoIngresada: {
    codigo: 13,
    mensaje: 'El campo la contraseña no puede estar vacío'
  },
  pwdNoValida: {
    codigo: 14,
    mensaje: 'La contraseña solo puede contener caracteres alfanuméricos y los caracteres especiales: - @ . $ * # & + _'
  },
  pwdMuyCorta: {
    codigo: 15,
    mensaje: 'La contraseña es muy corta (Mínimo 8 caracteres)'
  },
  pwdMuyLarga: {
    codigo: 16,
    mensaje: 'La contraseña es muy larga (Máximo 50 caracteres)'
  },

  // Errores del Nombre
  nombreNoIngresado: {
    codigo: 17,
    mensaje: 'El campo de nombre no puede estar vacío'
  },
  nombreMuyCorto: {
    codigo: 18,
    mensaje: 'El nombre es muy corto (Mínimo 1 caracter)'
  },
  nombreMuyLargo: {
    codigo: 19,
    mensaje: 'El nombre es muy largo (Máximo 50 caracteres)'
  },

  // Errores del apellido
  apellidoNoIngresado: {
    codigo: 20,
    mensaje: 'El campo de apellido no puede estar vacío'
  },
  apellidoMuyCorto: {
    codigo: 21,
    mensaje: 'El apellido es muy corto (Mínimo 1 caracter)'
  },
  apellidoMuyLargo: {
    codigo: 22,
    mensaje: 'El apellido es muy largo (Máximo 50 caracteres)'
  },

  // Errores de la fecha
  fechaDeNacimientoNoIngresada: {
    codigo: 23,
    mensaje: 'La fecha de Nacimiento no puede estar vacía'
  },
  noEsMayorDeEdad: {
    codigo: 24,
    mensaje: 'Para crearte una cuenta debes ser mayor de edad'
  },
  noEsDate: {
    codigo: 36,
    mensaje: 'Fecha no válida'
  },
  yearInvalido: {
    codigo: 38,
    mensaje: `Año inválido. Debe ingresar un año mayor a ${minimumYear()}`
  },
  fechaEnPasado: {
    codigo: 39,
    mensaje: 'Fecha no válida. No puede ingresar una fecha que ya pasó'
  },

  //Errores del token
  tokenInvalido: {
    codigo: 25,
    mensaje: 'El token no es correcto o el usuario no tiene una sesión abierta'
  },

  //Errores del body
  faltanDatos: {
    codigo: 26,
    mensaje: 'Faltan datos en el body'
  },


  //                    Errores de las tareas
  // Errores del Titulo
  tituloVacio: {
    codigo: 27,
    mensaje: 'El título no puede estar vacío'
  },
  tituloNoValido: {
    codigo: 28,
    mensaje: 'Título Inválico. El título debe estar compuesto solo por caracteres alfanuméricos'
  },
  tituloMuyLargo: {
    codigo: 29,
    mensaje: 'El título no puede contener más de 255 caracteres'
  },

  // Errores de la descripcion
  descripcionVacia: {
    codigo: 30,
    mensaje: 'La descripción no puede estar vacío'
  },
  descripcionMuyLarga: {
    codigo: 31,
    mensaje: 'La descripción no puede contener más de 250 caracteres'
  },
  isCode: {
    codigo: 37,
    mensaje: 'La descripción no puede tener código'
  },

  //Errores del id
  idInvalido: {
    codigo: 32,
    mensaje: 'EL id ingresado no es válido'
  },
  idNoEncontrado:{
    codigo: 33,
    mensaje: 'El id ingresado no existe en este usuario'
  },

  // Errores de la categoría
  categoriaNoExiste: {
    codigo: 34,
    mensaje: "La categoría ingresada no existe"
  },
  noHayTareas: {
    codigo: 35,
    mensaje: "No hay tareas en esta categoría"
  },

  idNoExiste: {
    codigo: 40,
    mensaje: "No existe una tarea con el id enviado"
  },

  usuarioNoAutorizado: {
    codigo: 41,
    mensaje: "Este usuario no está autorizado a eliminar la tarea que desea eliminar"
  },

  // Funciones
  validarErroresRegistro,
  validarErroresDeTareas,
  validarErroresCambiaPass,
  validarErroresUpdateTarea,
  validarErroresForgotPass
}

function minimumYear() {
  return new Date().getFullYear() - 100;
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
      validadorDeErroresDelRegistro(e.errors.email.kind, Errores.correoNoIngresado,
        Errores.correoNoValido, Errores.correoMuyCorto, Errores.correoMuyLargo, errores);
    }

    if (validator.contains(jsonDelError, 'username')) {
      validadorDeErroresDelRegistro(e.errors.username.kind, Errores.usuarioNoIngresado,
        null, Errores.usuarioMuyCorto, Errores.usuarioMuyLargo, errores);
    }

    if (validator.contains(jsonDelError, 'password')) {
      validadorDeErroresDelRegistro(e.errors.password.kind, Errores.pwdNoIngresada,
        Errores.pwdNoValida, Errores.pwdMuyCorta, Errores.pwdMuyLarga, errores);
    }

    if (validator.contains(jsonDelError, 'nombre')) {
      validadorDeErroresDelRegistro(e.errors.nombre.kind, Errores.nombreNoIngresado,
        null, Errores.nombreMuyCorto, Errores.nombreMuyLargo, errores);
    }

    if (validator.contains(jsonDelError, 'apellido')) {
      validadorDeErroresDelRegistro(e.errors.apellido.kind, Errores.apellidoNoIngresado,
        null, Errores.apellidoMuyCorto, Errores.apellidoMuyLargo, errores);
    }

    if (validator.contains(jsonDelError, 'fechaDeNacimiento')) {
      validadorDeErroresDelRegistro(e.errors.fechaDeNacimiento.kind, Errores.fechaDeNacimientoNoIngresada,
        Errores.noEsMayorDeEdad, Errores.yearInvalido, Errores.noEsDate, errores);
    }
  }
  return errores;
}

function validadorDeErroresDelRegistro(kind, noIngresado, noValido, muyCorto, muyLargo, errores) {
  switch(kind) {
    case 'required': errores.push(noIngresado);
      break;
    case 'user defined': errores.push(noValido);
      break;
    case 'minlength': errores.push(muyCorto);
      break;
    case 'maxlength': errores.push(muyLargo);
      break;
    case 'Date': errores.push(muyLargo);
      break;
    case 'isNotValidDate': errores.push(muyCorto);
  }
}

function validarErroresCambiaPass(body){
  if((body.password == undefined) || (body.passwordViejo == undefined))
    throw(Errores.faltanDatos);
  if (body.password.length < 8)
    throw(Errores.pwdMuyCorta)
  else if (body.password.length > 50)
    throw(Errores.pwdMuyLarga);
}

function validarErroresDeTareas(e) {
  var errores = [];
  var jsonDelError = JSON.stringify(e.errors);

  if (jsonDelError) {
    if (validator.contains(jsonDelError, 'titulo')) {
      validadorDeErroresDeTareas(e.errors.titulo.kind, Errores.tituloVacio, Errores.tituloNoValido, Errores.tituloMuyLargo, errores);
    }

    if (validator.contains(jsonDelError, 'descripcion')) {
      validadorDeErroresDeTareas(e.errors.descripcion.kind, Errores.descripcionVacia, Errores.isCode, Errores.descripcionMuyLarga, errores);
    }

    if (validator.contains(jsonDelError, 'fechaParaSerCompletada')) {
      validadorDeErroresDeTareas(e.errors.fechaParaSerCompletada.kind, null, Errores.noEsDate, Errores.fechaEnPasado, errores);
    }
  }
  return errores;
}

function validadorDeErroresDeTareas(kind, noIngresado, noValido, muyLargo, errores) {
  switch(kind) {
    case 'required': errores.push(noIngresado);
      break;
    case 'maxlength': errores.push(muyLargo);
      break;
    case 'user defined': errores.push(noValido);
      break;
    case 'Date': errores.push(noValido);
      break;
    case 'isCode': errores.push(noValido);
      break;
    case 'fechaEnPasado': errores.push(muyLargo);
  }
}

function validarErroresUpdateTarea(body, id){
  var errores = []
  if(!ObjectId.isValid(id))
    throw(Errores.idInvalido);
  if((!body.titulo) && (!body.descripcion) && (!body.fechaParaSerCompletada) && (!body.completado))
    throw(Errores.faltanDatos);
  if(body.titulo.length>50)
    throw(Errores.tituloMuyLargo);
  if (body.titulo.length > 250)
    throw(Errores.descripcionMuyLarga);
  if( !isAlphanumeric(body.titulo))
    throw(Errores.tituloNoValido);
  if(!isCode(body.descripcion))
    throw(Errores.isCode);
}

function validarErroresForgotPass(body){
  if(body.email == undefined)
    throw(Errores.faltanDatos);
  if(!validator.isEmail(body.email))
    throw (Errores.correoNoValido);
}

function isAlphanumeric(v) {
  var regex = /^[\w\s]+$/;
  return regex.test(v);
}

function isCode(v) {
  var regex= /<\/?[\w\s="/.':;#-\/\?]+>/gi;
  return !regex.test(v);
}


module.exports = {Errores};
