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
    trim: true,
    validate: {
      isAsync: false,
      validator: isCode,
      type: "isCode"
    }
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
    required: false,
    validate: {
      isAsync: false,
      validator: isValidDate,
      type: "fechaEnPasado"
    }
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

function isCode(v) {
  var regex= /<\/?[\w\s="/.':;#-\/\?]+>/gi;
  return !regex.test(v);
}

function isValidDate(v) {
  var day = v.getDate() + 1;
  var month = v.getMonth();
  var year = v.getFullYear();
  var currentDay = new Date().getDate();
  var currentMonth = new Date().getMonth();
  var currentYear = new Date().getFullYear();

  console.log(`Date: ${day}/${month}/${year}`);
  console.log(`Current date: ${currentDay}/${currentMonth}/${currentYear}`);

  if (year < currentYear) {
    return false;
  } else if ((year == currentYear) && (month < currentMonth)) {
    return false;
  } else if ((month == currentMonth) && (day < currentDay)) {
    return false;
  }
  return true;
}

module.exports = {Tarea};
