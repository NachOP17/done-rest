var {Usuario} = require('./../modelos/usuario');
var {Categoria} = require('./../modelos/categoria');
var {Errores} = require('./../modelos/errores');
var {app} = require('./../server');
var winston = require('winston');

const tsFormat = () => (new Date()).toLocaleTimeString();


const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      //level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `_server.log`,
      timestamp: tsFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      handleExceptions: true,
      humanReadableUnhandledException: true
      //level: env === 'development' ? 'verbose' : 'info'
    })
  ]
});

var autenticar = (req, res, next) => {
  logger.info('Autenticando');
  var token = req.header('x-auth');
  Usuario.findByToken(token).then((usuario) => {
    // logger.info('Autenticar');
    if (!usuario) {
      return Promise.reject();
    }
    req.usuario = usuario;
    req.token = token;
    next();
  }).catch((e) => {
     res.status(401).send(Errores.tokenInvalido);
     logger.error(Errores.tokenInvalido);
  });
};

var buscarCategoria = (categoriaReq) => {
    Categoria.findByCategory(categoriaReq).then((categoria) => {
      console.log(caregoria);
      return categoria;
    }).catch((e) => {
      res.status(400).send("Error buscando la categoría");
    })
}

module.exports = {autenticar};
