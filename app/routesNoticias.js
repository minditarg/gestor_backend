
var bodyParser = require('body-parser');
var general = require('./functionsGeneral');
var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


  app.get('/list-noticias/:idNoticia', general.isLoggedIn, function (req, res) {
    let idNoticia = parseInt(req.params.idNoticia);
    try {
      connection.query("CALL noticias_detail(?)", [[idNoticia]], function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ success: 1, noticia: result[0], tags: result[1] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-mis-noticias/:idNoticia', general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    let idNoticia = parseInt(req.params.idNoticia);
    try {
      connection.query("CALL mis_noticias_detail(?)", [[idNoticia, idUser]], function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ success: 1, noticia: result[0], tags: result[1] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.get('/list-noticias', general.isLoggedIn, function (req, res) {

    try {
      connection.query("CALL noticias_list", function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-mis-noticias-bytipo/:idTipoNoticia', general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    let idTipoNoticia = parseInt(req.params.idTipoNoticia);

    console.log(req.user);


    try {
      connection.query("CALL mis_noticias_list_bytipo(?)", [[idTipoNoticia, idUser]], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });



  app.get('/list-noticias-bytipo/:idTipoNoticia', general.isLoggedIn, function (req, res) {

    let idTipoNoticia = parseInt(req.params.idTipoNoticia);

    try {
      connection.query("CALL noticias_list_bytipo(?)", [idTipoNoticia], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.get('/list-transparente-inicial'/*, general.isLoggedIn*/, function (req, res) {
    let idTipoNoticia = 4;
    let id_categoria_personal = req.query.id_categoria_personal || null;
    let id_categoria_transparente = req.query.id_categoria_transparente || null;
    let fecha_inicio = req.query.fecha_inicio || null;
    let busqueda = req.query.busqueda || null;
   
    try {
      connection.query("select n.*, ut.descripcion as user_type FROM noticias n inner join users u on n.id_user = u.id inner join users_type ut on ut.id = u.id_users_type where n.estado = 1 and n.id_tipo_noticia = 4 and n.fecha_inicio > SUBDATE(NOW(), 1) order by n.fecha_inicio limit 10", null, function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }


  });


  app.get('/list-transparente-byquery'/*, general.isLoggedIn*/, function (req, res) {
    let idTipoNoticia = 4;
    let id_categoria_personal = req.query.id_categoria_personal || null;
    let id_categoria_transparente = req.query.id_categoria_transparente || null;
    let fecha_inicio = req.query.fecha_inicio || null;
    let busqueda = req.query.busqueda || null;
   
    try {
      connection.query("CALL noticias_list_transparente_byquery(?)", [[idTipoNoticia,id_categoria_personal,id_categoria_transparente,fecha_inicio,busqueda]], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }


  });

  
  app.get('/list-videos-byquery'/*, general.isLoggedIn*/, function (req, res) {
    let idTipoNoticia = 5;
    let id_categoria_personal = req.query.id_categoria_personal || null;
    let id_categoria_transparente = req.query.id_categoria_transparente || null;
    let fecha_inicio = req.query.fecha_inicio || null;
    let busqueda = req.query.busqueda || null;
   
    try {
      connection.query("CALL noticias_list_videos_byquery(?)", [[idTipoNoticia,id_categoria_personal,id_categoria_transparente,fecha_inicio,busqueda]], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }


  });


  app.post('/insert-noticia', general.isLoggedIn, bodyJson, function (req, res) {
    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let idUser = (req.user && req.user.id) || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;

    let tags = req.body.tags || [];
    let id_categoria_personal = req.body.id_categoria_personal || null;
    let id_categoria_transparente = req.body.id_categoria_transparente || null;


    try {
      connection.query("CALL noticias_insert(?)", [[nombre, descripcion, idTipoNoticia, idTipoCategoria, idUser, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultInsert) {
        if (err) return res.status(500).send(err.sqlMessage);
        if (tags.length > 0) {

          recorrerArrayTags(0, tags, resultInsert[0][0].id_noticia, function (err, result) {

          });
        }

        res.json({ success: 1, resultInsert });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  function recorrerArrayTags(index, arrayTags, idNoticia, callback) {
    try {
      connection.query("CALL noticias_tag_insert(?)", [[idNoticia, arrayTags[index]]], function (err, result) {
        if (err) return callback(err);

        if (arrayTags.length > index + 1)
          recorrerArrayTags(index + 1, arrayTags, idNoticia, callback)
        else
          callback(err, result);

      })
    } catch (e) {
      return callback(e.message)
    }



  }


  app.post('/update-noticia', bodyJson, general.isLoggedIn, function (req, res) {
    let idNoticia = req.body.id || null;

    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;
    let id_categoria_personal = req.body.id_categoria_personal || null;
    let id_categoria_transparente = req.body.id_categoria_transparente || null;


    let tags = req.body.tags || [];
    try {
      connection.query("CALL noticias_update(?)", [[idNoticia, nombre, descripcion, idTipoNoticia, idTipoCategoria, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultUpdate) {
        if (err) return res.status(500).send(err.sqlMessage);

        connection.query("DELETE FROM tags WHERE id_noticia = ?", [idNoticia], function (err, resultDelete) {
          if (tags.length > 0) {
            recorrerArrayTags(0, tags, idNoticia, function (err, result) {

            });
          }
        })



        res.json({ success: 1, resultUpdate });



      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.post('/update-mi-noticia', bodyJson, general.isLoggedIn, function (req, res) {
    let idNoticia = req.body.id || null;

    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idUser = (req.user && req.user.id) || null;
    let idUserType = (req.user && req.user.id_users_type) || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;
    let id_categoria_personal = req.body.idCategoriaPersonal || null;
    let id_categoria_transparente = req.body.idCategoriaTransparente || null;


    let tags = req.body.tags || [];
    try {

      connection.query("SELECT * FROM noticias n LEFT JOIN users u ON u.id = n.id_user WHERE n.id = ? AND u.id_users_type = ?", [idNoticia, idUserType], function (err, resultSelect) {

        if (!resultSelect.length)
          return res.status(500).send("no esta autorizado para modificar la noticia");


        connection.query("CALL noticias_update(?)", [[idNoticia, nombre, descripcion, idTipoNoticia, idTipoCategoria, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultUpdate) {
          if (err) return res.status(500).send(err.sqlMessage);

          connection.query("DELETE FROM tags WHERE id_noticia = ?", [idNoticia], function (err, resultDelete) {
            if (tags.length > 0) {
              recorrerArrayTags(0, tags, idNoticia, function (err, result) {

              });
            }
          })



          res.json({ success: 1, resultUpdate });



        })

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });



  app.post('/delete-mi-noticia', bodyJson, general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    try {
      connection.query("CALL mis_noticias_delete(?)", [[req.body.id, idUser]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/delete-noticia', bodyJson, general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    try {
      connection.query("CALL noticias_delete(?)", [[req.body.id]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/insert-noticia-image', bodyJson, general.isLoggedIn, function (req, res) {
    let extension = req.body.extension || null;
    try {
      connection.query("CALL noticias_insert_image(?)", [[extension]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-types-noticias', general.isLoggedIn, function (req, res) {

    try {
      connection.query("CALL noticias_tipos_list", function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.get('/list-types-categorias', general.isLoggedIn, function (req, res) {

    try {
      connection.query("CALL noticias_categorias_tipos_list", function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.post('/list-noticias-in', bodyJson, general.isLoggedIn, function (req, res) {
    let queryIn = req.body.queryIn
    try {
      connection.query("SELECT * FROM noticias WHERE id IN (?)", [queryIn], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });



  function checkConnection(req, res, next) {
    console.log(connection.state);
    //  connection = mysql.createConnection(dbconfig.connection);



    next();

  }


}
