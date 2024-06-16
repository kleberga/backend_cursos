const port = 4000
const express = require('express')
const routes = require("./routes/routes")
const app = express();
const cors = require('cors');

// permitir o uso de arquivos .env
require("dotenv").config();

// utilizar o CORS para que requisicoes de outros dominios possam acessar as API's
app.use(cors());

// utilizar json para receber e passar os dados
app.use(express.json());

// definir que a aplicacao deve usar as rotas criadas em outro arquivo
app.use("/", routes)

// criar o servidor na porta definida
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
