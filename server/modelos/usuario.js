// Hay un constante llamada PASS_SECRET y otra llamada JWT_SECRET
// Estas variables son constantes son unas letras al azar para
// hacer que la contraseña y el token sean más seguros

const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const {MD5} = require('crypto-js');
const jwt = require('jsonwebtoken');

var {Errores} = require('./errores');

var ModeloDeUsuario = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 50,
    required: true,
    unique: true,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: 'Correo no válido'
    }
  },

  username: {
    type: String,
    minlength: 1,
    maxlength: 20,
    required: true,
    unique: true
  },

  password: {
    type: String,
    minlength: 8,
    maxlength: 50,
    required: true,
    validate: {
      isAsync: false,
      validator: isAlphanumeric,
    }
  },

  nombre: {
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true
  },

  apellido: {
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true
  },

  fechaDeNacimiento: {
    type: Date,
    required: false,
    validate: [{
      isAsync: false,
      validator: esMayorDeEdad,
      message: 'No es mayor de edad'
    }, {
      isAsync:  false,
      validator: isValidDate,
      type: "isNotValidDate"
    }]
  },

  activo: {
    type: Boolean,
    required: true,
    default: true
  },

  fechaDeRegistro: {
    type: Date,
    required: true,
    default: Date.now
  },

  formaDeRegistro: {
    type: String,
    required: true,
    default: "Web"
  },

  intentos: {
    type: Number,
    default: 0
  },

  tokens: [{
  // El token se crea cada vez que un usuario inicia sesión en algún dispositivo
  // al cerrar sesión el token es eliminado
  // Cada token es único del usuario y esto valida que el usuario es quien dice ser
  // ya metido dentro de la aplicación para hacer algún cambio en alguna parte
  // como eliminar una tarea o hacer algún cambio en su perfil
    acceso: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});

function esMayorDeEdad(v) {
  var day = v.getDate() + 1;
  var month = v.getMonth();
  var year = v.getFullYear();
  var currentDay = new Date().getDate();
  var currentMonth = new Date().getMonth();
  var currentYear = new Date().getFullYear();

  var edad = currentYear - year;
  if (currentMonth > month) {
    edad--;
  } else if (currentMonth == month && currentDay > day) {
    edad--;
  }
  if (edad < 18) {
    return false;
  }
  return true;
};

function isAlphanumeric(v) {
  var regex = /^[-@.$*#&+_\w]*$/;
  return regex.test(v);
}

function isValidDate(v) {
  var year = v.getFullYear();
  return year > minimumYear();
}

var minimumYear = function() {
  return new Date().getFullYear() - 100;
}

ModeloDeUsuario.methods.toJSON = function() {
  var usuario = this;
  var objetoUsuario = usuario.toObject();
  var camposPermitidos = ['_id', 'email', 'username', 'nombre', 'apellido', 'fechaDeNacimiento'];

  return _.pick(objetoUsuario, camposPermitidos);
};

ModeloDeUsuario.methods.generarTokenDeAutenticidad = function() {
  // El .methods permite crear métodos que pueden ser utilizados
  // en los objetos de la clase Usuario
  var usuario = this;
  var acceso = 'auth';
  var token = jwt.sign({_id: usuario._id.toHexString(), acceso}, process.env.JWT_SECRET).toString();

  usuario.tokens.push({acceso, token});

  return usuario.save().then(() => {
    return token;
  });
};

ModeloDeUsuario.methods.eliminarToken = function(token) {
  var usuario = this;

  return usuario.update({
    $pull: {
      tokens: {token}
    }
  });
};

ModeloDeUsuario.statics.findByToken = function(token) {
  // .static crea un método estático de la clase
  // No es necesario crear un objeto para usar este método
  var Usuario = this;
  var usuarioDecodificado;

  try {
    usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return Usuario.findOne({
    '_id': usuarioDecodificado._id,
    'tokens.token': token,
    'tokens.acceso': 'auth'
  });
};

ModeloDeUsuario.statics.findByCredentials = function(username, password) {
  var Usuario = this;
  var userToBeFound = {username};

  if (validator.isEmail(username)) {
    var email = username;
    userToBeFound = {email};
  }

  return Usuario.findOne(userToBeFound).then((usuario) => {
    if (!usuario) {
      return Promise.reject({code: 1});
    }

    return new Promise((resolve, reject) => {
      if (passwordsCoinciden(usuario.password, password)) {
        resolve(usuario);
      } else {
        reject({code: 2,
          user: usuario
        });
      }
    });
  });
};

ModeloDeUsuario.pre('save', function(next) {
  // Este método encripta la contraseña de la forma MD5
  var usuario = this;

  if (usuario.isModified('password')) {
    usuario.password = encriptarPassword(usuario.password);
    next();
  } else {
    next();
  }
});

var passwordsCoinciden = (passwordUsuario, password) => {
  password = encriptarPassword(password);
  return (password === passwordUsuario);
};

var encriptarPassword = (password) => {
  var encriptado = MD5(password).toString();
  return encriptado + process.env.PASS_SECRET;
};

ModeloDeUsuario.statics.encrypt = (password) => {
  var encriptado = MD5(password).toString();
  return encriptado + process.env.PASS_SECRET;
};

var Usuario = mongoose.model('Usuario', ModeloDeUsuario);

module.exports = {Usuario};
