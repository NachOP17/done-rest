const mongoose = require('mongoose');

var Categoria = mongoose.model('Categoria', {
  categoria: {
    type: String,
    required: true
  },

  activo: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = {Categoria};
