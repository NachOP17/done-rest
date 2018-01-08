const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Errores} = require('./../modelos/errores');
const {app} = require('./../server');
const {Tarea} = require('./../modelos/tarea');
const {Usuario} = require('./../modelos/usuario');

const idUsuarioUno = new ObjectId();
const idTarea1= new ObjectId();
const idTarea2 = new ObjectId();
const idTarea3 = new ObjectId();

const usuarios = [{
  _id: idUsuarioUno,
  email: "prueba@gmail.com",
  username: "pruebas",
  password: Usuario.encrypt("12345678"),
  nombre: "Prueba",
  apellido: "Demail",
  fechaDeNacimiento: "08/09/1997",
}];

const tareas = [{
  _id: idTarea1,
  titulo: 'Prueba',
  descripcion: 'Esto es una prueba',
  _creador: idUsuarioUno
}, {
  _id: idTarea2,
  titulo: 'Prueba 2',
  descripcion: 'Esta es la segunda prueba',
  _creador: idUsuarioUno
}, {
  _id: idTarea3,
  titulo: 'Prueba 3',
  descripcion: 'Esta es la tercera prueba',
  _creador: idUsuarioUno,
  categoria: 'Personal'
}];

beforeEach((done) => {
  Usuario.remove({}).then(() =>
  Usuario.insertMany(usuarios)).then(() => done());
});

beforeEach((done) => {
  Tarea.remove({}).then(() =>
  Tarea.insertMany(tareas)).then(() => done());
});

describe('POST /tareas', () => {
  it('Debería crear una nueva tarea', (done) => {
    var titulo = 'Prueba';
    var descripcion = 'Esto es una prueba';
    //console.log(usuarios[0].tokens[0].token);

    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        request(app)
          .post('/tareas')
          .set('x-auth', token)
          .send({
            titulo,
            descripcion
          })
          .expect(200)
          .expect(Errores.correcto)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            Tarea.find().then((tareas) => {
              expect(tareas.length).toBe(4);
              expect(tareas[0].titulo).toBe(titulo);
              done();
            }).catch((e) => done(e));
          });
      })
    })
  });

  it('El título solo debe contener caracteres Alfanuméricos', (done) => {
    var titulo = 'Otra_*prueba';
    var descripcion = 'Esto es una prueba';
    var codigo = 28;

    tareasError(done, titulo, descripcion, codigo);
  });

  it('El título no puede estar vacío', (done) => {
    var titulo = '';
    var descripcion = 'Esto es una prueba';
    var codigo = 27;

  tareasError(done, titulo, descripcion, codigo);
  });

  it('El título no puede contener más de 255 caracteres', (done) => {
    var titulo = '12345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890';
    var descripcion = 'Esto es una prueba';
    var codigo = 29;

    tareasError(done, titulo, descripcion, codigo);
  });

  it('La descripción no puede contener tags de html', (done) => {
    var titulo = 'Prueba';
    var descripcion = '<script>alert("Esto es una prueba");</script>'
    var codigo = 37;

    tareasError(done, titulo, descripcion, codigo);
  });

  it('La descripción no puede contener más de 255 caracteres', (done) => {
    var titulo = 'Prueba';
    var descripcion = '12345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890';
    var codigo = 31;

    tareasError(done, titulo, descripcion, codigo);
  });

  it('La descripción no puede estar vacía', (done) => {
    var titulo = 'Prueba';
    var descripcion = '';
    var codigo = 30;

  tareasError(done, titulo, descripcion, codigo);
  });

  it('No se puede agregar una categoría que no existe', (done) => {
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        request(app)
          .post('/tareas')
          .set('x-auth', token)
          .send({
            titulo: 'Prueba',
            descripcion: 'Descripcion',
            categoria: 'Universidad'
          })
          .expect(404)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            expect(res.body.codigo).toBe(34);
            Tarea.find().then((tareas) => {
              expect(tareas.length).toBe(3);
              done();
            }).catch((e) => done(e));
          });
      })
    })
  });

  it('La fecha debe ser de tipo Date', (done) => {
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        request(app)
          .post('/tareas')
          .set('x-auth', token)
          .send({
            titulo: 'Prueba',
            descripcion: 'Descripcion',
            categoria: 'Trabajo',
            fechaParaSerCompletada: 'Hola'
          })
          .expect(400)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            expect(res.body[0].codigo).toBe(36);
            Tarea.find().then((tareas) => {
              expect(tareas.length).toBe(3);
              done();
            }).catch((e) => done(e));
          });
      })
    })
  });
});

var tareasError = function(done, titulo, descripcion, codigo){
  Usuario.findOne().then((usuario) => {
    usuario.generarTokenDeAutenticidad().then((token) => {
      request(app)
        .post('/tareas')
        .set('x-auth', token)
        .send({
          titulo,
          descripcion
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          expect(res.body[0].codigo).toBe(codigo);
          Tarea.find().then((tareas) => {
            expect(tareas.length).toBe(3);
            done();
          }).catch((e) => done(e));
        });
    })
  })
}

describe('GET /tareas', () => {
  it('Debería buscar todas las tareas de un usuario', (done) => {
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        request(app)
          .get('/tareas')
          .set('x-auth', token)
          .expect(200)
          .end((err, res) => {
            if (err)
              return done(err)
            Tarea.find().then((tareas) => {
              expect(tareas.length).toBe(3);
              done();
            }).catch((e) => done(e));
          });
      });
    });
  });

  it('No debería devolver las tareas si un usuario no está autorizado', (done) => {
    request(app)
      .get('/tareas')
      .set('x-auth', 'hola')
      .expect(401)
      .end((err, res) => {
        if (err)
          return done(err);
        expect(res.body.codigo).toBe(25);
        done();
      });
  });

  it('Debería buscar todas las tareas pertenecientes a una categoría de un usuario', (done) => {
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        request(app)
          .get('/tareas/Personal')
          .set('x-auth', token)
          .expect(200)
          .end((err, res) => {
            if (err)
              return done(err)
            done()
          });
      });
    });
  });
});

describe('PATCH tareas/:id', () => {

  it('Retorna 400 si el json está vacío', (done) => {
    var id = tareas[0]._id.toHexString();
    var tarea = {};
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        metodoPatchTareas(tarea, idTarea1, token, 400, Errores.faltanDatos, done)
      })
    })
  });

  it('Retorna 404 si el id no se encuentra', (done) => {
    var tarea = {
      titulo: "Nuevo titulo",
      descripcion: "Nueva descripcion"
    }
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        metodoPatchTareas(tarea, idUsuarioUno, token, 404, Errores.idNoEncontrado, done)
      })
    })
  });

  it('Retorna 400 si el id es invalido', (done) => {
    var tarea = {
      titulo: "Nuevo titulo",
      descripcion: "Nueva descripcion"
    }
    Usuario.findOne().then( (usuario) => {
      usuario.generarTokenDeAutenticidad().then( (token) => {
        metodoPatchTareas(tarea, "y28ed2y8eg4", token, 400, Errores.idInvalido, done);
      })
    })
  });

  it('Actualiza los datos de la tarea correctamente', (done) => {
    var tarea = {
      titulo: "Nuevo titulo",
      descripcion: "Nueva descripcion",
      completado: true
    }
    Usuario.findOne().then( (usuario) => {
      usuario.generarTokenDeAutenticidad().then( (token) => {
        request(app)
          .patch(`/tareas/${idTarea1}`)
          .send(tarea)
          .set('x-auth', token)
          .expect(200)
          .end( (res) => {
            Tarea.findOne({_id: idTarea1}).then( (todo) => {
              expect(todo.titulo).toBe(tarea.titulo);
              expect(todo.descripcion).toBe(tarea.descripcion);
              expect(todo.completado).toBe(true);
              done();
            })
          })
      })
    })
  })

});

var metodoPatchTareas = function(tarea, id, token, status, error, done){
  request(app)
    .patch(`/tareas/${id}`)
    .send(tarea)
    .set("x-auth", token)
    .expect(status)
    .expect(error)
    .end((err,res) => {
      if (err)
        return done(err);
      Tarea.findOne({_id: idTarea1}).then((todo) => {
        expect(todo.titulo).toBe("Prueba");
        expect(todo.descripcion).toBe("Esto es una prueba");
        done();
      }).catch((e) => done(e));
    })
}

describe('ENVIAR /usuario', () => {

  it('El nombre de usuario no puede estar repetido', (done) => {
    var user = {
      email: "prueba1@gmail.com",
      username: "pruebas",
      password: "12345678",
      nombre: "Prueba",
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    };
    metodoRequestPostUsuario(done, user, Errores.usuarioExistente, 400)
  });

  it('El email no puede estar repetido', (done) => {
    var user = {
      email: "prueba@gmail.com",
      username: "pruebas1",
      password: "12345678",
      nombre: "Prueba",
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    };

    metodoRequestPostUsuario(done, user, Errores.correoExistente, 400)
  });

  it('El nombre de usuario no puede tener mas de 20 caracteres', (done) => {
    var user = {
      email: "prueba1@gmail.com",
      username: "pruebas1sadjwidheuhfweufwyfgweyfbwhcdbhwebdweybdfkwe",
      password: "12345678",
      nombre: "Prueba",
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    };
    metodoRequestPostUsuario(done, user, Errores.usuarioMuyLargo, 400)
  });

  it('El correo no puede tener más de 50 caracteres', (done) => {
    var user = {
      email: "prueba1adadeadewybdedyayudawyedveyadvagvdyuqevdyaevyudavdyvydveydveydveydve"+
      "hdauehdaedhcvnnvreydgyuedgayuedgyuedgayuedgyuedgeydgyedgeydgeydgeydgedyg11wsdwddew"+
      "degdedgbkmploañjaieohdundñakmdopeajdioedmopdepodkioaejdiaedoedmaomioemdim@gmail.com",
      username: "pruebas1",
      password: "12345678",
      nombre: "Prueba",
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    };
    metodoRequestPostUsuario(done, user, Errores.correoMuyLargo, 400)
  });

  it("El nombre no puede tener mas de 50 caracteres", (done) => {
    var user = {
      email: "prueba1@gmail.com",
      username: "pruebas",
      password: "12345678",
      nombre: '12345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890',
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    }
    metodoRequestPostUsuario(done, user, Errores.nombreMuyLargo, 400);
  });

  it('El apellido no puede tener más de 50 caracteres', (done) => {
    var user = {
      email: "prueba1@gmail.com",
      username: "pruebas1",
      password: "12345678",
      nombre: "Prueba",
      apellido: '12345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890',
      fechaDeNacimiento: "08/09/1997"
    };
    metodoRequestPostUsuario(done, user, Errores.apellidoMuyLargo, 400);
  });

  it('El email no es valido' , (done) => {
    var user = {
      email: "hdeiuhdeiuhdieu",
      username: "aaaa",
      password: "124S45678",
      nombre: "loaskdo",
      apellido: "emfdewnffe",
      fechaDeNacimiento: "08/09/1997"
    };
    metodoRequestPostUsuario(done, user, Errores.correoNoValido, 400);
  });

  it('El usuario no es mayor de edad por el año', (done) => {
    var year = new Date().getFullYear() - 17;
    var user = {
      email: 'prueba1@example.com',
      username: 'prueba1',
      password: '12345678',
      nombre: 'Prueba',
      apellido: 'kjhsfsf',
      fechaDeNacimiento: '08/09/' + year
    };
    metodoRequestPostUsuario(done, user, Errores.noEsMayorDeEdad, 400);
  });

  it('El usuario no es mayor de edad por el mes', (done) => {
    var mes = new Date().getMonth();
    var user = {
      email: 'prueba1@example.com',
      username: 'prueba1',
      password: '12345678',
      nombre: 'Prueba',
      apellido: 'kjhsfsf',
      fechaDeNacimiento: mes + '/01/1999'
    };
    metodoRequestPostUsuario(done, user, Errores.noEsDate, 400);
  });

  it('El usuario no es mayor de edad por el dia', (done) => {
    var dia = new Date().getDate();
    var user = {
      email: 'prueba1@example.com',
      username: 'prueba1',
      password: '12345678',
      nombre: 'Prueba',
      apellido: 'kjhsfsf',
      fechaDeNacimiento: '12/' + dia-1 + '/2000'
    };
    metodoRequestPostUsuario(done, user, Errores.noEsMayorDeEdad, 400);
  });

  it('Crea el usuario correctamente', (done) => {
    var user = {
      email: "pepito@gmail.com",
      username: "aaaa",
      password: "124S45678",
      nombre: "loaskdo",
      apellido: "emfdewnffe",
      fechaDeNacimiento: "08/09/1997"
    };
    request(app)
      .post('/usuarios')
      .send(user)
      .expect(200)
      .expect(Errores.correcto)
      .end((res) => {
        Usuario.find().then((users) => {
          expect(users.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });

 });


 // Categorías
 describe('GET Categorias', () => {
   it('Debería devolver todas las categorías', (done) => {
     request(app)
       .get('/categorias')
       .expect(200)
       .end((err, res) => {
         if(err) return done(err);
         expect(res.body.length).toBe(4);
         done();
       });
   });
 })


 var metodoRequestPostUsuario = function(done, user, error, codigo_error){
   request(app)
    .post('/usuarios')
    .send(user)
    .expect(codigo_error)
    .expect([error])
    .end((err, res) => {
      if (err) return done(err);
      Usuario.find().then((users) => {
        expect(users.length).toBe(1);
        done();
      }).catch((e) => done(e));
    });
 }


describe('POST usuarios/login (Iniciar Sesión)', () => {
  var id = usuarios[0]._id.toHexString();
  it('Bloquea cuenta de usuario después de 5 intentos fallidos', (done) => {
    var user =  {
      username: "pruebas",
      password: "1234567"
    };
    Usuario.findByIdAndUpdate(id, {
      $set:{
        intentos: 4
      }
    }, {new: true}).then((usuarios) => console.log());
    request(app)
      .post('/usuarios/login')
      .send(user)
      .expect(401)
      .expect(Errores.usuarioBloqueado)
      .end((err, res) => {
        if (err) return done (err);
        Usuario.findOne().then((usuario) => {
          expect(usuario.intentos).toBe(5);
          expect(usuario.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Suma 1 a los intentos si la contraseña no existe', (done) => {
    var user = {
      username: 'pruebas',
      password: 'ksanndjshafbf'
    };
    request(app)
      .post('/usuarios/login')
      .send(user)
      .expect(401)
      .expect(Errores.passwordIncorrecta)
      .end((err, res) => {
        if (err) return done(err);
        Usuario.findOne().then((usuario) => {
          expect(usuario.intentos).toBe(1);
          expect(usuario.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Reinicializa la cantidad de intentos en 0 al iniciar sesión correctamente', (done) => {
    var user = {
      username: "pruebas",
      password: "12345678"
    };
    Usuario.findByIdAndUpdate(id,{
      $set:{
        intentos: 2
      }
    }, {new: true}).then((usuario) => console.log());
    request(app)
      .post('/usuarios/login')
      .send(user)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        Usuario.findOne().then((usuario) => {
          expect(usuario.intentos).toBe(0);
          expect(usuario.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});



describe('PATCH de usuarios(desbloquear cuenta)', () => {
  var id = usuarios[0]._id.toHexString();
  var user = {
    password: Usuario.encrypt("124568")
  };

  it('Desbloquea usario y cambia la contraseña', (done) => {
    Usuario.findByIdAndUpdate(id, {
      $set: {
        intentos: 5
      }
    }, {new: true}).then((usuario) => console.log());
    request(app)
    .patch(`/usuarios/me/${id}`)
    .send(user)
    .expect(200)
    .expect(Errores.correcto)
    .end((res)=> {
      Usuario.findOne().then((usuario) => {
        expect(usuario.password).toBe(Usuario.encrypt(user.password));
        expect(usuario.intentos).toBe(0);
        done();
      })
    });
  });
  it('Si id no es valido retorna error 404', (done) => {
    request(app)
    .patch('/usuarios/me/124241')
    .send(user)
    .expect(404)
    .end(done);
  })
  it('Si id no existe retorna error 404', (done) => {
    request(app)
    .patch('/usuarios/me/5a209e58d31f5f2742972152')
    .send(user)
    .expect(404)
    .end(done);
  })

});

describe('PATCH usuarios/me/pass(cambiar contraseña)', () => {
  it('Retorna 401 si usuario no tiene sesión iniciada o el token es incorrecto', (done) => {
    var user ={
      passwordViejo: "12345678",
      password: "amdiwbdywebdwbdw"
    };
    request(app)
      .patch('/usuarios/me/pass')
      .send(user)
      .set("x-auth", '14142212')
      .expect(401)
      .expect(Errores.tokenInvalido)
      .end((err, res) => {
        if(err) return done(err);
        Usuario.findOne().then((usuario) => {
          expect(usuario.password).toBe(usuarios[0].password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Retorna 404 si el password anterior no es el de la cuenta', (done) => {
    var user={
      passwordViejo: "adueudneueu",
      password: "deuind4eun"
    };
    cambiaPassWrong(done, 404, user, Errores.passwordIncorrecta);
  });
12345678
  it('Retorna 400 si falta algun dato', (done) => {
    var user= {
      passwordViejo: "12345678"
    };
    cambiaPassWrong(done,400, user, Errores.faltanDatos);
  });

  it('Retorna 400 si el password nuevo tiene más de 50 caracteres', (done) => {
    var user= {
      passwordViejo: "12345678",
      password: '12345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890123456789012345678901234567890'
    };
    cambiaPassWrong(done, 400, user, Errores.pwdMuyLarga);
  });

  it('Retorna 400 si el password nuevo tiene menos de 8 caracteres', (done) => {
    var user = {
      passwordViejo: "12345678",
      password: "124"
    };
    cambiaPassWrong(done, 400, user, Errores.pwdMuyCorta);
  })

  it('Cambia el pasword correctamente', (done) => {
    var user ={
      passwordViejo: "12345678",
      password: "amdiwbdywebdwbdw"
    };
    Usuario.findOne().then((usuario) => {
      usuario.generarTokenDeAutenticidad().then((token)=> {
        request(app)
          .patch('/usuarios/me/pass')
          .send(user)
          .set("x-auth", token, null)
          .expect(200)
          .expect(Errores.correcto)
          .end((err,res) => {
            if (err) return done(err);
            Usuario.findOne().then((usuario) => {
              expect(usuario.password).toBe(Usuario.encrypt(user.password));
              done();
            }).catch((e) => done(e));
          });
      });
    });
  })

});

var cambiaPassWrong = function(done, status, user, error){
  Usuario.findOne().then((usuario) => {
    usuario.generarTokenDeAutenticidad().then((token)=> {
      request(app)
        .patch('/usuarios/me/pass')
        .send(user)
        .set("x-auth", token, null)
        .expect(status)
        .expect(error)
        .end((err,res) => {
          if (err) return done(err);
          Usuario.findOne().then((usuario) => {
            expect(usuario.password).toBe(usuarios[0].password);
            done();
          }).catch((e) => done(e));
        });
    });
  });
}
