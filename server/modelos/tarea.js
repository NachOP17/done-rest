const mongoose = require('mongoose');
const validator = require('validator');

var Tarea = mongoose.model('Todo', {
  titulo: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    validate: {
      isAsync: false,
      validator: validator.isAlphanumeric
    }
  },

  descripcion: {
    type: String,
    maxlength: 250,
    required: true
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
    required: false
  },

  _categoria: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }
});

module.exports = {Tarea};
