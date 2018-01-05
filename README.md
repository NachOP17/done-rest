# done-rest

Endpoint: https://intense-lake-39874.herokuapp.com/


  ##############  USUARIOS:  ##############

* REGISTRO DE USUARIO

Guarda un nuevo usuario en la base de datos.

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios
Método: POST

Campos requeridos:
  {
    email,
    password,
    username,
    nombre,
    apellido,
    fechaDeNacimiento
  }

Errores que puede devolver el servidor:
- Se guardó satisfactoriamente:
  {
    codigo: 0,
    mensaje: 'Correcto'
  }

  ----------- Correo -----------

- El correo ya está registrado:
  {
    codigo: 5,
    mensaje: 'Este correo ya está en uso'
  }
- El campo de correo se envió vacío:
  {
    codigo: 6,
    mensaje: 'El campo de correo no puede estar vacío'
  }
- El correo es inválido, no es un correo electrónico:
  {
    codigo: 7,
    mensaje: 'El correo no es válido'
  }
- El correo es muy corto:
  {
    codigo: 8,
    mensaje: 'El correo es muy corto (Mínimo 1 caracter)'
  }
- El correo es muy largo:
  {
    codigo: 9,
    mensaje: 'El correo es muy largo (Máximo 50 caracteres)'
  }

  ----------- Nombre de Usuario -----------

- El nombre usuario ya está registrado:
  {
    codigo: 4,
    mensaje: 'Este usuario ya está en uso'
  }
- El nombre de usuario se envió vacío:
  {
    codigo: 10,
    mensaje: 'El campo de nombre de usuario no puede estar vacío'
  }
- Nombre de usuario muy corto:
  {
    codigo: 11,
    mensaje: 'El nombre de usuario es muy corto (Mínimo 1 caracter)'
  }
- Nombre de usuario muy largo:
  {
    codigo: 12,
    mensaje: 'El nombre de usuario es muy largo (Máximo 20 caracteres)'
  }

  ----------- Contraseña -----------

- El campo de contraseña se envió vacío:
  {
    codigo: 13,
    mensaje: 'El campo la contraseña no puede estar vacío'
  }
- La contraseña tiene caracteres inválidos:
  {
    codigo: 14,
    mensaje: 'La contraseña solo puede contener caracteres alfanuméricos y los caracteres especiales: - @ . $ * # & + _'
  }
- La contraseña es muy corta (mínimo 8 caracteres):
  {
    codigo: 15,
    mensaje: 'La contraseña es muy corta (Mínimo 8 caracteres)'
  }
- La contraseña es muy larga (máximo 50 caracteres):
  {
    codigo: 16,
    mensaje: 'La contraseña es muy larga (Máximo 50 caracteres)'
  }

  ----------- Nombre -----------

- El campo de nombre se envió vacío:
  {
    codigo: 17,
    mensaje: 'El campo de nombre no puede estar vacío'
  }
- El nombre es muy corto:
  {
    codigo: 18,
    mensaje: 'El nombre es muy corto (Mínimo 1 caracter)'
  }
- El nombre es muy largo (máximo 50 caracteres):
  {
    codigo: 19,
    mensaje: 'El nombre es muy largo (Máximo 50 caracteres)'
  }

  ----------- Apellido -----------

- El campo de apellido se envió vacío:
  {
    codigo: 20,
    mensaje: 'El campo de apellido no puede estar vacío'
  }
- El apellido es muy corto:
  {
    codigo: 21,
    mensaje: 'El apellido es muy corto (Mínimo 1 caracter)'
  }
- El apellido es muy largo:
  {
    codigo: 22,
    mensaje: 'El apellido es muy largo (Máximo 50 caracteres)'
  }

  ----------- Fecha de Nacimiento -----------

- El campo de fecha de nacimiento se envió vacío:
  {
    codigo: 23,
    mensaje: 'La fecha de Nacimiento no puede estar vacía'
  }
- El usuario es menor de edad:
  {
    codigo: 24,
    mensaje: 'Para crearte una cuenta debes ser mayor de edad'
  }
- El tipo de dato enviado no es de tipo Date:
  {
    codigo: 36,
    mensaje: 'Fecha no válida'
  }
- El año ingresado debe ser mayor al año actual - 100
{
  codigo: 38,
  mensaje: `Año inválido. Debe ingresar un año mayor a ${minimumYear()}`
}


* LOGIN

Verifica que el usuario existe en la base de datos e inicia su sesión.
Devuelve un token por el header con el nombre de x-auth.
También devuelve el token en cuerpo de la respuesta del request.

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios/login
Método: POST

Campos requeridos:
  {
    username,
    password
  }

Errores que puede devolver el servidor:
- Se guardó satisfactoriamente:
  {
    codigo: 0,
    mensaje: 'Correcto'
  }

  ----------- Nombre de Usuario -----------

- El usuario no está registrado (es incorrecto):
  {
    codigo: 1,
    mensaje: 'Usuario Incorrecto'
  }
- El usuario fue bloqueado por introducir la contraseña de manera incorrecta 5 veces o más
  {
    codigo: 3,
    mensaje: 'Su usuario se encuentra bloqueado, hemos enviado una nueva contraseña a su correo para que pueda iniciar sesión'
  }
- El campo de usuario está vacío:
  {
    codigo: 10,
    mensaje: 'El campo de nombre de usuario no puede estar vacío'
  }

  ----------- Contraseña -----------

- Contraseña incorrecta:
  {
    codigo: 2,
    mensaje: 'Contraseña Incorrecta'
  }
- El campo de contraseña está vacío:
  {
    codigo: 13,
    mensaje: 'El campo la contraseña no puede estar vacío'
  }


* OBTENER DATOS DEL USUARIO

Devuelve los datos del usuario.
Para poder hacer este GET se necesita mandar el token por el header con el nombre de x-auth

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios/me
Método: GET

Campos devueltos:
{
  _id,
  email,
  username,
  nombre,
  apellido,
  fechaDeNacimiento
}

Errores que puede devolver el servidor:
- El usuario no está autorizado a saber esta información (token inválido):
  {
    codigo: 25,
    mensaje: 'El token no es correcto o el usuario no tiene una sesión abierta'
  }


* CAMBIAR CONTRASEÑA

Actualiza la contraseña del usuario.
Se necesita pasar el token por el header con el nombre de x-auth

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios/me/pass
Método: PATCH

Campos requeridos:
  {
    passwordViejo,
    password
  }


* DESBLOQUEAR USUARIO POR ID

Si el usuario está bloqueado, lo desbloquea.
Se necesita pasar el id del usuario a través del endpoint y la nueva contraseña en forma de JSON

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios/me/:id
Método: PATCH

Campos requeridos:
  {
    password
  }


* CERRAR SESIÓN

Se necesita pasar el token por el header con el nombre de x-auth

Endpoint: https://intense-lake-39874.herokuapp.com/usuarios/me/token
Método: DELETE

Errores que puede devolver el servidor:
- El usuario no está autorizado a saber esta información (token inválido):
  {
    codigo: 25,
    mensaje: 'El token no es correcto o el usuario no tiene una sesión abierta'
  }
