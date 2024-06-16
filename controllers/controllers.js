const httpStatus = require('http-status-codes')
const db = require("../infra/db");
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// cadastrar o aluno 
exports.inserirAlunoCT = async (req, res) => {
    const aluno = req.body
    const verificar_email = await db.consultarAlunoDB(aluno)
    if(verificar_email){
        return res.status(409).send("Erro: o e-mail informado já está cadastrado!")
    }
    if(aluno.senha.length < 8){
        return res.status(400).send("Erro: a senha precisa ter no mínimo 8 dígitos!")
    }
    if(aluno.nome.length < 5){
        return res.status(400).send("Erro: o nome precisa ter pelo menos 5 caracteres!")
    }
    const dataNasc = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
    if(!dataNasc.test(aluno.data_nasc)){
        return res.status(400).send("Erro: a data de nascimento tem que ser no formato 'AAAA-MM-DD'!")
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(aluno.email)) {
        return res.status(400).send("Erro: e-mail inválido!")
    }
    try{
        await db.inserirAlunoDB(aluno);
        return res.status(200).send("Aluno cadastrado com sucesso!");
    } catch(error){
        return res.status(400).send(error.message)
    }
}

// listar os cursos 
exports.carregarCursosCT = async (req, res) => {
    try{
        const cursos = await db.carregarCursosDB();
        return res.status(200).send(cursos.rows)
    } catch(error){
        return res.status(400).send(error.message)
    }
}

// fazer o login do usuario 
exports.loginCT = async (req, res) => {
    const usuario = await db.loginDB(req.body)
    if(usuario.rows.length == 0){
        return res.status(400).send("Senha ou e-mail inválidos!")
    }
    const password_match = await bcrypt.compareSync(req.body.senha, usuario.rows[0].senha)
    if(!password_match){
        return res.status(400).send("Senha ou e-mail inválidos!")
    }
    const id_usuario = usuario.rows[0].id
    const token = jwt.sign({ id_usuario }, process.env.SECRET, {
        // expira em 5 minutos
        expiresIn: 300
    });
    res.cookie("authorization", token)
    return res.json({ auth: true, token: token });
}

// validar o token 
exports.verifyJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
      // se tudo estiver ok, salva no request para uso posterior
      req.userId = decoded.id_usuario;
    });
    next()
}

// efetuar logout do aluno 
exports.logout = (req, res) => {
    return res.json({auth: false, token: null})
}

// inscrever aluno em curso 
exports.inscreverCursoCT = async (req, res) => {
    const id_usuario = parseInt(req.userId)
    const id_curso = req.params.idCurso
    if(!id_usuario){
        return res.status(403).send("Usuário não logado!")
    }
    if(!id_curso){
        return res.status(404).send("O curso não existe!")
    }
    try{
        const listarInscritos = await db.listarCursosInscritosComIDAlunoDB(id_usuario, id_curso, true);
        if(listarInscritos.rows.length != 0){
            return res.status(409).send("Erro: o aluno já está inscrito neste curso!") 
        } 
        const listarInscritos2 = await db.listarCursosInscritosComIDAlunoDB(id_usuario, id_curso, false);
        if(listarInscritos2.rows.length != 0) {
            return res.status(409).send("Erro: o aluno não pode se inscrever em um curso na qual cancelou a inscrição anteriormente!")  
        }
        await db.inscreverCursoDB(id_usuario, id_curso)
        return res.status(200).send("Inscrição efetuada com sucesso!") 
    } catch(error) {
        return res.status(400).send(error.message)
    }
} 

// cancelar a inscricao do aluno em um curso 
exports.cancelarInscricaoCT = async (req, res) => {
    const id_usuario = parseInt(req.userId)
    const id_curso = req.params.idCurso
    if(!id_usuario){
        return res.status(403).send("Usuário não logado!")
    }
    if(!id_curso){
        return res.status(404).send("O curso não existe!")
    }
    try{
        const listarInscritos = await db.listarCursosInscritosComIDAlunoDB(id_usuario, id_curso, true);
        if(listarInscritos.rows.length != 0){
            await db.cancelarInscricaoDB(id_usuario, id_curso)
            return res.status(200).send("Inscrição cancelada com sucesso!")
        } else {
            return res.status(406).send("Não foi possível cancelar a inscrição: o usuário não está inscrito neste curso!")  
        }
    } catch(error) {
        return res.status(400).send(error.message)
    }
}

// cancelar a inscricao do aluno em um curso 
exports.listarCursosInscritosCT = async (req, res) => {
    const id_usuario = parseInt(req.userId)
    if(!id_usuario){
        return res.status(403).send("Usuário não logado!")
    }
    try{
        const listarInscritos = await db.listarCursosInscritosDB(req.params.idUsuario);
        return res.status(200).send(listarInscritos.rows) 
    } catch(error) {
        return res.status(400).send(error.message)
    }
}