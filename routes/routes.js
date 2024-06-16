const express = require('express')
const router = express.Router()
const controllers = require("../controllers/controllers")

// rota para cadastrar o usuario
router.post('/usuarios', controllers.inserirAlunoCT)

// rota para efetuar o login do usuario
router.post('/login', controllers.loginCT)

// rota para listar os cursos
router.get('/cursos', controllers.carregarCursosCT)

// rota para o aluno se inscrever em um curso
router.post('/cursos/:idCurso', controllers.verifyJWT, controllers.inscreverCursoCT)

// rota para o aluno cancelar a inscricao em um curso
router.put('/cursos/:idCurso', controllers.verifyJWT, controllers.cancelarInscricaoCT)

// rota para listar os cursos em que o aluno está inscrito e também os que ele cancelou a inscrição
router.get('/:idUsuario', controllers.verifyJWT, controllers.listarCursosInscritosCT)

// rota para logout
router.post('/logout', controllers.logout)

module.exports = router