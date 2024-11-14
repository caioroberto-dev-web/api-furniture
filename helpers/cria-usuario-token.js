//IMPORTA JSON WEB TOKEN
const jwt = require("jsonwebtoken");

//VARIÁVEL DE AMBIENTE
const secretKey = process.env.SECRETKEY;

const criaUsuarioToken = async (usuario, req, res) => {
  //CRIA TOKEN
  const token = jwt.sign(
    {
      nome: usuario.nome,
      id: usuario.idUsuario,
    },
    `${secretKey}`,
    {
      expiresIn: 84000,
    }
  );

  //RETORNA TOKEN
  res.status(201).json({
    message: "Usuário autenticado com sucesso!",
    token: token,
    idUsuario: usuario.idUsuario,
    nome: usuario.nome,
    image: usuario.image,
    loggedIn: true,
  });
};

module.exports = criaUsuarioToken;
