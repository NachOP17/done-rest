const mongoose = require('mongoose');
const P = mongoose.Promise = require('bluebird');

var ModeloCategoria = new mongoose.Schema({
  categoria: {
    type: String,
    required: true
  },

  activo: {
    type: Boolean,
    required: true,
    default: true
  }
});

ModeloCategoria.statics.findByCategory = function(categoria) {
  var Categoria = this;
  return Categoria.findOne({
    categoria: categoria,
    activo: true
  });
};

var Categoria = mongoose.model('Categoria', ModeloCategoria);

var sampleData = [
  {categoria: "Personal"},
  {categoria: "Trabajo"},
  {categoria: "Hogar"},
  {categoria: "Estudios"}
]

Categoria.find({
  categoria: "Trabajo"
}).then((categoria) => {
  if ((categoria[0] == undefined)) {
      P.all(sampleData.map(i => new Categoria(i).save()))
        .then(() => console.log('Categorías guardadas'))
        .catch((err) => console.log('Error: ' + err));
  }
});

module.exports = {Categoria};
