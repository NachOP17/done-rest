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
        if (err)  return done(err);
        Usuario.find().then((usuarios) => {
          expect(usuarios.length).toBe(1);
          done();
        }).catch((e) => done(e));
     });
  });
 });
    //  });

describe('Iniciar Sesión', () => {
  var id = usuarios[0]._id.toHexString();
  it('Bloquea cuenta de usuario después de 5 intentos fallidos', (done) => {
    var user =  {
      username: "pruebas",
      password: "12345678"
    };
    Usuario.findByIdAndUpdate(id, {
      $set:{
        intentos: 5
      }
    }, {new: true}).then((usuarios) => console.log());
    request(app)
      .post('/usuarios/login')
      .send(user)
      .expect(401)
      .expect({
        codigo: '3',
        mensaje: 'Su usuario se encuentra bloqueado, hemos enviado una nueva contraseña a su correo para que pueda iniciar sesión'
      })
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
      .expect({
        codigo: '2',
        mensaje: 'Contraseña Incorrecta'
      })
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
      .expect({
        codigo: '0',
        mensaje: 'Correcto'
      })
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
