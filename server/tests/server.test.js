const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

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
  it('El email no puede estar repetido', (done) => {
    var user = {
      email: "prueba@gmail.com",
      username: "pruebas",
      password: "12345678",
      nombre: "Prueba",
      apellido: "Demail",
      fechaDeNacimiento: "08/09/1997"
    };
    // usuario = new Usuario(user);
    // usuario.save();
    request(app)
      .post('/usuarios')
      .send(user)
      .expect(400)
      .end((err, res) => {
        if (err)  done(err);
        Usuario.find().then((usuarios) => {
          expect(usuarios.length).toBe(1);
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
    console.log(user);

  it('Desbloquea usario y cambia la contraseña', (done) => {
    Usuario.findByIdAndUpdate(id, {
      $set: {
        intentos: 5
      }
    }, {new: true}).then((usuario) => console.log());
    console.log(user);
    request(app)
    .patch(`/usuarios/me/${id}`)
    .send(user)
    .expect(200)
    .expect({
      codigo: "0",
      mensaje: "Correcto"
    })
    .end((res)=> {
      Usuario.findOne().then((usuario) => {
        expect(usuario.password).toBe(Usuario.encrypt(user.password));
        expect(usuario.intentos).toBe(0);
        done();
      })
    });
  })
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
