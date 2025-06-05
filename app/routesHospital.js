var general = require('./functionsGeneral');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var mkdirp = require('mkdirp');
var path = require('path');
var bodyUrlencoded = bodyParser.urlencoded({
 	extended: true
});
var bodyJson = bodyParser.json();
var bcrypt = require('bcrypt-nodejs');


module.exports = function (app,connection, passport) {

    function checkConnection(req, res, next) {
		console.log(connection.state);
		//connection = mysql.createConnection(dbconfig.connection);
		next();
	}

	// function isLoggedIn(req, res, next) {
	// 	// if user is authenticated in the session, carry on
	// 	if (req.isAuthenticated())
	// 		return next();
	// 	// if they aren't redirect them to the home page
	// 	res.json({ success: 3, error_msj: "no esta autenticado" });
	// }

	function formatFecha(fecha) {
    if (!fecha) return null;
    const d = new Date(fecha);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}


    /********************************* */
    /*CLIENTES*/
    /********************************* */

    app.get('/list-clientes', general.isLoggedIn, function (req, res) {
        connection.query("SELECT c.*, tc.descripcion as 'tipocliente' FROM clientes c INNER JOIN tipos_clientes tc ON c.id_tipo_cliente = tc.id WHERE c.estado = 1 order by c.apellido, c.nombre", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-clientes', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [101], connection) }, function (req, res) {
		let id_tipo_cliente = req.body.id_tipo_cliente || null;
        var arrayIns = [req.body.nombre, req.body.apellido, req.body.dni, req.body.telefono, req.body.direccion, id_tipo_cliente, req.body.mail, /*req.body.nro_historia_clinica,*/ req.body.vet_derivante, req.body.estado_cuenta, 1];
		connection.query("CALL clientes_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.get('/list-tipo-cliente', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM tipos_clientes WHERE estado = 1", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    app.get('/list-clientes/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM clientes WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-cliente', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [101], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let nombre = req.body.nombre || null;
            let apellido = req.body.apellido || null;
            let dni = req.body.dni || null;
            let telefono = req.body.telefono || null;
            let direccion = req.body.direccion || null;
            let id_tipo_cliente = req.body.id_tipo_cliente || null;
            let mail = req.body.mail || null;
			//let nro_historia_clinica = req.body.nro_historia_clinica|| null; 
			let vet_derivante = req.body.vet_derivante|| null; 
			let estado_cuenta = req.body.estado_cuenta|| null;

			let arrayIns = [id, nombre, apellido, dni, telefono, direccion, id_tipo_cliente, mail, /*nro_historia_clinica,*/ vet_derivante, estado_cuenta];
			connection.query("CALL clientes_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de clientes no esta ingresado" })

		}
	});

    app.post('/delete-cliente', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE clientes SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de clientes", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla clientes no esta ingresado" })

		}
	});

	/********************************* */
    /*PACIENTES*/
    /********************************* */

    app.get('/list-pacientes', general.isLoggedIn, function (req, res) {
        connection.query("CALL pacientes_listar()", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
			
        });
    });

    app.post('/insert-pacientes', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [102], connection) }, function (req, res) {
		let id_cliente = req.body.id_cliente || null;
		let id_clase = req.body.id_clase || null;
		let id_especie = req.body.id_especie || null;
		let id_raza = req.body.id_raza || null;
		let id_sexo = req.body.id_sexo || null;
		let id_alimentacion = req.body.id_alimentacion || null;
		let id_habitos = req.body.id_habitos || null;
		let id_mascotas = req.body.id_mascotas || null;
        var arrayIns = [req.body.nombre, id_cliente, id_clase, id_especie, id_raza,  req.body.color, id_sexo, req.body.castrado, req.body.notas, req.body.fecha_nacimiento, req.body.fecha_adopcion, id_alimentacion, id_habitos, id_mascotas, req.body.nro_historia_clinica, 1];
		connection.query("CALL pacientes_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.get('/list-cliente', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM clientes WHERE estado = 1 ORDER BY APELLIDO, NOMBRE", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-clase', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM clases WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-especie', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM especies WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-especie-patologias', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM especies WHERE estado = 1 OR id = 5 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-raza', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM razas WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-sexo', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM sexos WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    app.get('/list-pacientes/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM pacientes WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-paciente', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [102], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let nombre = req.body.nombre || null;
			let id_cliente = req.body.id_cliente || null;
			let id_clase = req.body.id_clase || null;
			let id_especie = req.body.id_especie || null;
			let id_raza = req.body.id_raza || null;
			let color = req.body.color || null;
			let id_sexo = req.body.id_sexo || null;
			let castrado = req.body.castrado || null;
			let notas = req.body.notas || null; 
			let fecha_nacimiento = formatFecha(req.body.fecha_nacimiento) || null; 
			let fecha_adopcion = formatFecha(req.body.fecha_adopcion) || null;
			let id_alimentacion = req.body.id_alimentacion || null;
			let id_habitos = req.body.id_habitos || null;
			let id_mascotas = req.body.id_mascotas || null;
			let nro_historia_clinica = req.body.nro_historia_clinica|| null;

			let arrayIns = [id, nombre, id_cliente, id_clase, id_especie, id_raza, color, id_sexo, castrado, notas, fecha_nacimiento, fecha_adopcion, id_alimentacion, id_habitos, id_mascotas, nro_historia_clinica];
			connection.query("CALL pacientes_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de pacientes no esta ingresado" })

		}
	});

    app.post('/delete-paciente', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE pacientes SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de clientes", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla clientes no esta ingresado" })

		}
	});

	app.get('/list-alimentacion', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM pacientes_alimentacion WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-habitos', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM pacientes_habitos WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-mascotas', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM pacientes_mascotas WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-especies_por_clase/:id_clase', general.isLoggedIn, function (req, res) {
		var id_clase = parseInt(req.params.id_clase) || 0;
		console.log(id_clase);
		connection.query("CALL especies_listar_por_clase(?)", [id_clase], function (err, result) {
			if (err) return res.status(500).send(err);

			res.json({ success: 1, result: result[0] });
		});

	});
	
	app.get('/list-razas_por_especie/:id_especie', general.isLoggedIn, function (req, res) {
		var id_especie = parseInt(req.params.id_especie) || 0;
		console.log(id_especie);
		connection.query("CALL razas_listar_por_especie(?)", [id_especie], function (err, result) {
			if (err) return res.status(500).send(err);

			res.json({ success: 1, result: result[0] });
		});

	});

	/********************************* */
    /*CLASES*/
    /********************************* */

    app.get('/list-clases', general.isLoggedIn, function (req, res) {
        connection.query("SELECT * FROM clases WHERE estado = 1 ORDER BY descripcion", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-clases', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [105], connection) }, function (req, res) {
		var arrayIns = [req.body.descripcion, 1];
		connection.query("CALL clases_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-clase', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE clases SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de clases", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla clases no esta ingresado" })

		}
	});

    app.get('/list-clases/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM clases WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-clase', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [105], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;

			let arrayIns = [id, descripcion];
			connection.query("CALL clases_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de clases no esta ingresado" })

		}
	});

	/********************************* */
    /*ESPECIES*/
    /********************************* */

    app.get('/list-especies', general.isLoggedIn, function (req, res) {
        connection.query("SELECT e.*, c.descripcion as 'nombreclase' FROM especies e INNER JOIN clases c ON c.id = e.id_clase WHERE e.estado = 1  ORDER BY e.descripcion", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-especies', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [103], connection) }, function (req, res) {
		let id_clase = req.body.id_clase || null;
		var arrayIns = [req.body.descripcion, id_clase, 1];
		connection.query("CALL especies_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-especie', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE especies SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de especies", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla especies no esta ingresado" })

		}
	});

    app.get('/list-especies/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM especies WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-especie', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [103], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;
			let id_clase = req.body.id_clase || null;

			let arrayIns = [id, descripcion, id_clase];
			connection.query("CALL especies_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de especies no esta ingresado" })

		}
	});

	/********************************* */
    /*RAZAS*/
    /********************************* */

    app.get('/list-razas', general.isLoggedIn, function (req, res) {
        connection.query("SELECT r.*, e.descripcion as 'nombreespecie' FROM razas r INNER JOIN especies e ON e.id = r.id_especie WHERE r.estado = 1  ORDER BY r.descripcion", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-razas', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [103], connection) }, function (req, res) {
		let id_especie = req.body.id_especie || null;
		var arrayIns = [req.body.descripcion, id_especie, 1];
		connection.query("CALL razas_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-raza', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE razas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de razas", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla razas no esta ingresado" })

		}
	});

    app.get('/list-razas/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM razas WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-raza', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [103], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;
			let id_especie = req.body.id_especie || null;

			let arrayIns = [id, descripcion, id_especie];
			connection.query("CALL razas_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de razas no esta ingresado" })

		}
	});

	/********************************* */
    /*PATOLOGIAS*/
    /********************************* */

    app.get('/list-patologias', general.isLoggedIn, function (req, res) {
		connection.query("SELECT p.*, e.descripcion as 'nombreespecie' FROM patologias p INNER JOIN especies e ON e.id = p.id_especie WHERE p.estado = 1  ORDER BY p.descripcion", function (err, result) {
        //connection.query("SELECT * FROM patologias WHERE estado = 1 ORDER BY descripcion", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-patologias', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [106], connection) }, function (req, res) {
		let id_especie = req.body.id_especie || null;
		var arrayIns = [req.body.descripcion, id_especie, 1];
		connection.query("CALL patologias_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-patologia', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE patologias SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de patologias", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla patologias no esta ingresado" })

		}
	});

    app.get('/list-patologias/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM patologias WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-patologia', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [106], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;
			let id_especie = req.body.id_especie || null;

			let arrayIns = [id, descripcion, id_especie];
			connection.query("CALL patologias_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de patologias no esta ingresado" })

		}
	});

	/********************************* */
    /*SERVICIOS*/
    /********************************* */

    app.get('/list-servicios', general.isLoggedIn, function (req, res) {
        connection.query("SELECT * FROM servicios WHERE estado = 1 ORDER BY codigo", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-servicios', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [107], connection) }, function (req, res) {
		var arrayIns = [req.body.codigo, req.body.descripcion, req.body.tratamiento, req.body.consulta, 1];
		connection.query("CALL servicios_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-servicio', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE servicios SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de servicios", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla servicios no esta ingresado" })

		}
	});

    app.get('/list-servicios/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM servicios WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-servicio', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [107], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let codigo = req.body.codigo || null;
			let descripcion = req.body.descripcion 
			let tratamiento = req.body.tratamiento|| null; 
			let consulta = req.body.consulta|| null;

			let arrayIns = [id, codigo, descripcion, tratamiento, consulta];
			connection.query("CALL servicios_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de servicios no esta ingresado" })

		}
	});

	/********************************* */
    /*CONSULTAS*/
    /********************************* */

    app.get('/list-consultas', general.isLoggedIn, function (req, res) {
        connection.query("CALL consultas_listar()", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
			
        });
    });

    app.post('/insert-consultas', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [108], connection) }, function (req, res) {
		let id_paciente = req.body.idPaciente || null;
		let id_servicio = req.body.id_servicio || null;
		let id_signos = req.body.id_signos || null;
		let id_sensorio = req.body.id_sensorio || null;
		let id_mucosa = req.body.id_mucosa || null;
		let id_diag_presuntivo = req.body.id_diag_presuntivo || null;
		let id_pronostico = req.body.id_pronostico || null;
		let id_diag_definitivo = req.body.id_diag_definitivo || null;
		var arrayIns = [id_paciente, id_servicio, req.body.temperatura, req.body.peso, id_sensorio, id_mucosa, req.body.tllc, req.body.frecuencia_cardiaca, req.body.frecuencia_respiratoria, req.body.ganglios, req.body.anexos_cutaneos, /*req.body.consulta,*/ req.body.fecha, id_signos, req.body.anamnesis,req.body.examen_objetivo_particular, req.body.diag_complementarios, id_diag_presuntivo, req.body.tratamiento, id_pronostico, id_diag_definitivo, req.body.informe_diagnostico, req.body.observaciones,1];
		connection.query("CALL consultas_insertar_new2(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

	app.get('/list-servicio', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM servicios WHERE estado = 1 ORDER BY codigo", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-paciente/:idPaciente', general.isLoggedIn, function (req, res) {

		var idPaciente = req.params.idPaciente;
		let arrayIns = [idPaciente]
		connection.query("CALL pacientes_listar_id(?)", [arrayIns], function (err, result) {
		//connection.query("SELECT * FROM pacientes WHERE id = ? AND estado > 0", [idPaciente], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

    app.post('/delete-consulta', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE consultas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de consultas", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla consultas no esta ingresado" })

		}
	});

    app.get('/list-consultas/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT c.*, s.tratamiento as 'checktratamiento', s.consulta as 'checkconsulta' FROM consultas c INNER JOIN servicios s ON c.id_servicio = s.id  WHERE c.id = ? AND c.estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-consulta', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [108], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let id_servicio = req.body.id_servicio || null;
			let temperatura = req.body.temperatura || null;
			let peso = req.body.peso || null;
			let id_sensorio = req.body.id_sensorio || null;
			let id_mucosa = req.body.id_mucosa || null;
			let tllc = req.body.tllc || null;
			let frecuencia_cardiaca = req.body.frecuencia_cardiaca || null;
			let frecuencia_respiratoria = req.body.frecuencia_respiratoria || null;
			let ganglios = req.body.ganglios || null;
			let anexos_cutaneos = req.body.anexos_cutaneos || null;
			//let consulta = req.body.consulta || null;
			let fecha = req.body.fecha || null;
			let id_signos = req.body.id_signos || null;
			let anamnesis = req.body.anamnesis || null;
			let examen_objetivo_particular = req.body.examen_objetivo_particular || null;
			let diag_complementarios = req.body.diag_complementarios || null;
			let id_diag_presuntivo = req.body.id_diag_presuntivo || null;
			let tratamiento = req.body.tratamiento || null;
			let id_pronostico = req.body.id_pronostico || null;
			let id_diag_definitivo = req.body.id_diag_definitivo || null;
			let informe_diagnostico = req.body.informe_diagnostico || null;
			let observaciones = req.body.observaciones || null;

			let arrayIns = [id, id_servicio, temperatura, peso, id_sensorio, id_mucosa, tllc, frecuencia_cardiaca, frecuencia_respiratoria, ganglios, anexos_cutaneos, /*consulta,*/ fecha, id_signos, anamnesis, examen_objetivo_particular, diag_complementarios, id_diag_presuntivo, tratamiento, id_pronostico, id_diag_definitivo, informe_diagnostico, observaciones];
			connection.query("CALL consultas_update_new2(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de consultas no esta ingresado" })

		}
	});

	app.post('/insert-archivo-consulta/:id/:nombre_foto', general.isLoggedIn, function (req, res) {

		var id = req.params.id;
		var nombre_foto = req.params.nombre_foto;

		var multer = require('multer');
		var storage = multer.diskStorage({
			destination: function (req, file, callback) {

				callback(null, './' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id);
			},
			filename: function (req, file, callback) {
				console.log(file);
				callback(null, file.originalname);
			}
		});
		var upload = multer({ storage: storage }).single('archivo');

		console.log(req);
		mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id));


		upload(req, res, function (err) {
			if (err) return res.status(500).send(err);


			if (req.params.id) {
				var id = parseInt(req.params.id);
				var objectoUpdate = { archivo: path.join('/' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id + "/" + nombre_foto) };
				connection.query("UPDATE consultas SET ? where id = ?", [objectoUpdate, id], function (err, result) {

					if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar modificar los datos de la operacion", err });
					res.json({ success: 1, result });
				})
			} else {
				res.json({ success: 0, error_msj: "el id de la tabla operaciones no esta ingresado" })
			}

		});


	});

	app.post('/delete-archivo-consulta', bodyJson, general.isLoggedIn, function (req, res) {

		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { archivo: null };
			connection.query("UPDATE consultas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de operaciones", err });
				res.json({ success: 1, result });
			});
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de operaciones no esta ingresado" })
		}
	});

	app.post('/insert-archivo-new-consulta/:id/:nombre_foto', general.isLoggedIn, function (req, res) {
		console.log("ID:" + req.params.id);
		var id = req.params.id || 0;
		var nombre_foto = req.params.nombre_foto;
		if (id == "undefined")
		{
			console.log("ID:" + id);
			var id = 0;
			console.log("ID:" + id);
		}
		var multer = require('multer');
		var storage = multer.diskStorage({
			destination: function (req, file, callback) {

				callback(null, './' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id);
			},
			filename: function (req, file, callback) {
				console.log(file);
				callback(null, file.originalname);
			}
		});
		var upload = multer({ storage: storage }).single('archivo');

		console.log(req);
		mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id));


		upload(req, res, function (err) {
			if (err) return res.status(500).send(err);


			if (req.params.id) {
				var id = parseInt(req.params.id) || 0;
				//var objectoUpdate = { archivo: path.join('/' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id + "/" + nombre_foto), estado: -1 };
				var arrayIns = [path.join('/' + process.env.UPLOAD_PATH + '/archivos/consulta/' + id + "/" + nombre_foto), -1];
				//connection.query("INSERT INTO consultas (archivo, estado) VALUES ? ", [objectoUpdate], function (err, result) {
					//connection.query("INSERT INTO consultas (archivo, estado) VALUES (?) ", [arrayIns], function (err, result) {
					connection.query("CALL consultas_archivo_insertar(?)",  [arrayIns], function (err, result) {
					if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar modificar los datos de la operacion", err });
					res.json({ success: 1, result });
				})
			} else {
				res.json({ success: 0, error_msj: "el id de la tabla operaciones no esta ingresado" })
			}

		});


	});

	app.post('/insert-consultas-archivo-subido', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [108], connection) }, function (req, res) {
		let id_paciente = req.body.idPaciente || null;
		let id_servicio = req.body.id_servicio || null;
		let id_signos = req.body.id_signos || null;
		let id_sensorio = req.body.id_sensorio || null;
		let id_mucosa = req.body.id_mucosa || null;
		let id_diag_presuntivo = req.body.id_diag_presuntivo || null;
		let id_pronostico = req.body.id_pronostico || null;
		let id_diag_definitivo = req.body.id_diag_definitivo || null;
		let id = req.body.idConsulta || null;
		var arrayIns = [id, id_paciente, id_servicio, req.body.temperatura, req.body.peso, id_sensorio, id_mucosa, req.body.tllc, 
			req.body.frecuencia_cardiaca, req.body.frecuencia_respiratoria, req.body.ganglios, req.body.anexos_cutaneos, 
			/*req.body.consulta,*/req.body.fecha, id_signos, req.body.anamnesis, 
			req.body.examen_objetivo_particular, req.body.diag_complementarios, id_diag_presuntivo, req.body.tratamiento, id_pronostico, id_diag_definitivo, req.body.informe_diagnostico, req.body.observaciones, 1];
		connection.query("CALL consultas_con_archivo_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

	app.get('/list-signo', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM signos_sintomas WHERE estado = 1 ORDER BY descripcion", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-sensorio', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM consultas_sensorios WHERE estado = 1 ORDER BY descripcion", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-mucosa', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM consultas_mucosas WHERE estado = 1 ORDER BY descripcion", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-pronostico', general.isLoggedIn, function (req, res) {

		connection.query("SELECT * FROM consultas_pronosticos WHERE estado = 1 ORDER BY descripcion", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-patologia/:idEspecie', general.isLoggedIn, function (req, res) {
		var id = req.params.idEspecie;
		connection.query("SELECT p.* FROM patologias p LEFT JOIN especies e ON e.id = p.id_especie LEFT JOIN pacientes pa ON pa.id_especie = e.id WHERE p.estado = 1 AND pa.id = ?  OR e.id = 5 ORDER BY p.descripcion", [id],function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-patologia-consulta/:idConsulta', general.isLoggedIn, function (req, res) {
		var id = req.params.idConsulta;
		// connection.query("SELECT p.* FROM patologias p LEFT JOIN especies e ON e.id = p.id_especie LEFT JOIN pacientes pa ON pa.id_especie = e.id	LEFT JOIN consultas c ON c.id_paciente = pa.id	WHERE p.estado = 1 AND c.id = ?	OR e.id = 5 ORDER BY p.descripcion;", [id],function (err, result) {
			connection.query("SELECT p.* from consultas c inner join pacientes pa on c.id_paciente = pa.id inner join patologias p on p.id_especie = pa.id_especie where p.estado = 1 and c.id = ? ORDER BY p.descripcion;", [id],function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	/********************************* */
    /*CONSULTAS*/
    /********************************* */

	// app.get('/list-fichas', general.isLoggedIn, checkConnection, function (req, res) {
    //     connection.query("CALL pacientes_listar()", function (err, result) {
    //         if (err) return res.json({ success: 0, error_msj: err });
    //         res.json({ success: 1, result });
			
    //     });
    // });

	app.get('/list-fichas/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("CALL fichas_listar(?)", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});
/*
	app.get('/list-fichas', general.isLoggedIn, checkConnection, function (req, res) {
        connection.query("CALL fichas_listar(2)", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
			
        });
    });
	*/

	/********************************* */
    /*SIGNOS Y SINTOMAS*/
    /********************************* */

    app.get('/list-signos', general.isLoggedIn, function (req, res) {
        connection.query("SELECT * FROM signos_sintomas WHERE estado = 1 ORDER BY descripcion", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-signos', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [105], connection) }, function (req, res) {
		var arrayIns = [req.body.descripcion, 1];
		connection.query("CALL signos_sintomas_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-signo', bodyJson, general.isLoggedIn, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE signos_sintomas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de signos y sintomas", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla signos y sintomas no esta ingresado" })

		}
	});

    app.get('/list-signos/:id', general.isLoggedIn, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM signos_sintomas WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-signo', bodyJson, general.isLoggedIn, (req, res, next) => { general.checkPermission(req, res, next, [105], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;

			let arrayIns = [id, descripcion];
			connection.query("CALL signos_sintomas_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de signos y sintomas no esta ingresado" })

		}
	});


}