const {ObjectId} = require('mongodb');

var {Tarea} = require('./../modelos/tarea');
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

var tareaCompletada = (req, res, next) => {
  var id = req.params.id;
  var body = req.body;
    logger.info(`PATCH /tareas/${id}`)
    if(!ObjectId.isValid(id)){
      logger.error(Errores.idInvalido);
      return res.status(400).send(Errores.idInvalido)
    }
  Tarea.findOne({
    _id: id,
    _creador: req.usuario.id
  }).then((tarea) => {
    // logger.info('Autenticar');
    if (!tarea) {
      return Promise.reject({code: 1});
    }
    if(tarea.completado){
      if( (body.completado == true) || body.completado == undefined)
      return Promise.reject({code: 2});
    }
    req.tarea = tarea;
    next();
  }).catch((e) => {
    console.log(e);
     switch(e.code){
       case 1: res.status(404).send(Errores.idNoEncontrado);
              logger.error(Errores.idNoEncontrado);
              break;
       case 2: res.status(400).send(Errores.yaCompletada);
               logger.error(Errores.yaCompletada);
               break;
      case 3: res.status(400).send(Errores.idInvalido);
              logger.error(Errores.idInvalido);
              break;
    }
  });
};

module.exports = {tareaCompletada};
