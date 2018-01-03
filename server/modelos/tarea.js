const mongoose = require('mongoose');
const validator = require('validator');

var Tarea = mongoose.model('Tarea', {
  titulo: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    trim: true,
    validate: {
      isAsync: false,
      validator: isAlphanumeric
    },

  },

  descripcion: {
    type: String,
    maxlength: 250,
    required: true,
    trim: true
  },

  completado: {
    type: Boolean,
    default: false,
    required: true
  },

  fechaDeRegistro: {
    type: Date,
    required: true,
    default: Date.now
  },

  fechaParaSerCompletada: {
    type: Date,
    required: false
  },

  _creador: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  _categoria: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }
});

function isAlphanumeric(v) {
  var regex = /^[\w\s]+$/;
  return regex.test(v);
}

module.exports = {Tarea};
