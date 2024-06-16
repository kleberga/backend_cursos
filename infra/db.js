const { Pool } = require('pg');
require("dotenv-safe").config();
const bcrypt = require('bcrypt');

// funcao para conectar com o banco de dados 
async function connect() {
    if (global.connection)
        return global.connection.connect();
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    //apenas testando a conexão
    const client = await pool.connect();
    console.log("Criou pool de conexões no PostgreSQL!");
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    client.release();
    //guardando para usar sempre a mesma conexao com o banco de dados
    global.connection = pool
    return pool.connect();
}

// funcao para verificar se o aluno já está cadastrado
async function consultarAlunoDB(aluno) {
    const base = await connect();
    const sql = "SELECT email FROM aluno;"
    const email_base = await base.query(sql)
    const result = []
    // converter o json em um array de javascript
    for(var i in email_base.rows){
        result.push(email_base.rows[i].email)
    }
    const pesquisa_email = result.some(m => m == aluno.email)
    return pesquisa_email
}

// funcao para cadastrar um aluno no banco de dados 
async function inserirAlunoDB(aluno) {
    const hash_password = bcrypt.hashSync(aluno.senha, 10);
    const base = await connect();
    const sql = 'INSERT INTO aluno (nome, email, data_nasc, senha) VALUES ($1, $2, $3, $4);';
    const values = [aluno.nome, aluno.email, aluno.data_nasc, hash_password];
    return await base.query(sql, values)
}

// funcao para capturar os cursos no banco de dados 
async function carregarCursosDB(){
    const base = await connect();
    const sql = 'SELECT * FROM curso WHERE inicio > NOW();'
    return await base.query(sql)
}

// funcao para verificar se um usuario consta no banco de dados
async function loginDB(dados){
    const base = await connect();
    const sql = 'SELECT id, senha FROM aluno WHERE email = $1;'
    return await base.query(sql, [dados.email])
}

// funcao para fazer inscricao de um aluno em um curso no banco de dados 
async function inscreverCursoDB(id_usuario, id_curso){
    const base = await connect();
    const sql = 'INSERT INTO aluno_curso (id_aluno, id_curso) VALUES ($1, $2);'
    const values = [id_usuario, id_curso,]
    return await base.query(sql, values)
}

// funcao para cancelar a inscricao do aluno em um curso 
async function cancelarInscricaoDB(id_usuario, id_curso){
    const base = await connect();
    const sql1 = 'SET TIMEZONE to "America/Sao_Paulo";'
    await base.query(sql1)
    const sql2 = 'UPDATE aluno_curso SET inscrito = false, data_cancel = NOW() WHERE id_aluno = $1 AND id_curso = $2;'
    const values = [id_usuario, id_curso]
    return await base.query(sql2, values)
}

// funcao para listar os cursos inscritos pelo aluno (incluindo os cancelados)
async function listarCursosInscritosDB(id_usuario){
    const base = await connect();
    const sql = 'SELECT cr.id, cr.nome, cr.descricao, cr.capa, cr.inscricoes, cr.inicio, cr.inscricao_cancelada, ac.inscrito FROM aluno_curso ac INNER JOIN curso cr ON ac.id_curso = cr.id WHERE ac.id_aluno = $1;'
    const values = [id_usuario]
    return await base.query(sql, values)
}

// funcao para listar os cursos inscritos pelo aluno (incluindo os cancelados) com retorno do id do aluno
async function listarCursosInscritosComIDAlunoDB(id_usuario, id_curso, vlr_inscrito){
    const base = await connect();
    const sql = 'SELECT ac.id_aluno, cr.id, cr.nome, cr.descricao, cr.capa, cr.inscricoes, cr.inicio, cr.inscricao_cancelada, ac.inscrito FROM aluno_curso ac INNER JOIN curso cr ON ac.id_curso = cr.id WHERE ac.id_aluno = $1 AND ac.id_curso = $2 AND ac.inscrito = $3;'
    const values = [id_usuario, id_curso, vlr_inscrito]
    return await base.query(sql, values)
}

// exportar as funcoes
module.exports = { inserirAlunoDB, carregarCursosDB, loginDB, inscreverCursoDB, cancelarInscricaoDB, listarCursosInscritosDB, 
    consultarAlunoDB, listarCursosInscritosComIDAlunoDB}