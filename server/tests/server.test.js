const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {Errores} = require('./../modelos/errores');
const {app} = require('./../server');
const {Tarea} = require('./../modelos/tarea');
const {Usuario} = require('./../modelos/usuario');


const usuarios = [{
  _id: new ObjectId(),
  email: "prueba@gmail.com",
  username: "pruebas",
  password: Usuario.encrypt("12345678"),
  nombre: "Prueba",
  apellido: "Demail",
  fechaDeNacimiento: "08/09/1997"
}];

beforeEach((done) => {
  Tarea.remove({}).then(() => done());
})

describe('ENVIAR /tarea', () => {
  it('Debería crear una nueva tarea', (done) => {
    var titulo = 'Prueba';
    var descripcion = 'Esto es una prueba';

    request(app)
      .post('/tareas')
      .send({
        titulo,
        descripcion
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.titulo).toBe(titulo)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Tarea.find().then((tareas) => {
          expect(tareas.length).toBe(1);
          expect(tareas[0].titulo).toBe(titulo);
          done();
        }).catch((e) => done(e));
      });
  });

  it('El título solo debe contener caracteres Alfanuméricos', (done) => {
    var titulo = 'Otra prueba';
    var descripcion = 'Esto es una prueba';

    request(app)
      .post('/tareas')
      .send({
        titulo,
        descripcion
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Tarea.find().then((tareas) => {
          expect(tareas.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

  it('El título no puede estar vacío', (done) => {
    var titulo = '';
    var descripcion = 'Esto es una prueba';

    request(app)
      .post('/tareas')
      .send({
        titulo,
        descripcion
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Tarea.find().then((tareas) => {
          expect(tareas.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

  it('El título no puede contener más de 255 caracteres', (done) => {
    var titulo = '12345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890' +
    '1234567890123456789012345678901234567890123456789012345678901234567890';
    var descripcion = 'Esto es una prueba';

    request(app)
      .post('/tareas')
      .send({
        titulo,
        descripcion
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        Tarea.find().then((tareas) => {
          expect(tareas.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});


beforeEach((done) => {
  Usuario.remove({}).then(() =>
  Usuario.insertMany(usuarios)).then(() => done());
});

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
    // usuario = new Usuario(user);
    // usuario.save();

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
    console.log(year);
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
    console.log(mes);
    var user = {
      email: 'prueba1@example.com',
      username: 'prueba1',
      password: '12345678',
      nombre: 'Prueba',
      apellido: 'kjhsfsf',
      fechaDeNacimiento: mes + '/01/1999'
    };
    metodoRequestPostUsuario(done, user, Errores.noEsMayorDeEdad, 400);
  });

  it('El usuario no es mayor de edad por el dia', (done) => {
    var dia = new Date().getDate();
    var user = {
      email: 'prueba1@example.com',
      username: 'prueba1',
      password: '12345678',
      nombre: 'Prueba',
      apellido: 'kjhsfsf',
      fechaDeNacimiento: '12/' + dia-1 + '/1999'
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
      .expect(Errores.correcto)
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





 // beforeEach((done) => {
 //   Usuario.remove({}).then(() =>
 //   Usuario.insertMany(usuarios)).then(() ).then(() => done());
 // });

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
