const mongoose = require('mongoose');

var ModeloCategoria = new mongoose.Schema({
  categoria: {
    type: String,
    required: true,
    unique: true
  },

  activo: {
    type: Boolean,
    required: true,
    default: true
  },

  _creador: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

ModeloCategoria.statics.findByCategory = function(categoria) {
  var Categoria = this;
  var categoryToBeFound = {categoria};

  return Categoria.findOne(categoryToBeFound);
};

var Categoria = mongoose.model('Categoria', ModeloCategoria);

module.exports = {Categoria};
