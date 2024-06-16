# Back-end para um aplicação web de venda de cursos #

O aplicativo em tela é um back-end com rotas para uma aplicação web de venda de cursos. Foram criadas rotas para:
- cadastrar um usuário;
- efetuar o login do usuário;
- listar os cursos disponíveis para inscrição;
- inscrever um usuário em um curso;
- cancelar a inscrição do usuário em um curso;
- listar os cursos em que o usuário está inscrito e também os cursos em que ele cancelou a inscrição; e
- efetuar logout.

Do ponto de vista técnico, o aplicativo possui as seguintes características:
- o aplicativo foi criado utilizando o ambiente de execução Node.js juntamente com o framework Express;
- os dados de usuário, curso e inscrição/cancelamento dos cursos foi salvo em um banco de dados PostgreSQL, o qual foi instanciado na cloud Railway;
- após efetuar o login, o aplicativo salva um token do usuário (utilizando a biblioteca 'jsonwebtoken'), para ser utilizando em algumas rotas, como na inscrição em um curso, sendo que este token expira em 5 minutos; e
- a senha do usuário é salva no banco de dados na forma de uma hash (utilizando a biblioteca 'bcrypt'), a fim de evitar que fique exposta aos usuários do banco de dados.
