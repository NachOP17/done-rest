const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {Errores} = require('./../modelos/errores')
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
