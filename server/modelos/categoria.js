const mongoose = require('mongoose');

var ModeloCategoria = new mongoose.Schema({
  categoria: {
    type: String,
    required: true
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

ModeloCategoria.statics.findByCategory = function(categoria, idUsuario) {
  var Categoria = this;
  return Categoria.findOne({
    categoria: categoria,
    _creador: idUsuario
  });
};

var Categoria = mongoose.model('Categoria', ModeloCategoria);

module.exports = {Categoria};
