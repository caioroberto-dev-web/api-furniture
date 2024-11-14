//IMPORTA JSON WEB TOKEN - JWT
const jwt = require("jsonwebtoken");

//IMPORTA MODEL USUÁRIO
const Usuario = require("../models/Usuario");

//VARIÁVEL DE AMBIENTE
const secretKey = process.env.SECRETKEY;

//PEGA USUARIO PELO JWT TOKEN
const pegaUsuarioToken = async (token, res) => {
  if (!token) {
    return res.status(401).json({ message: "Acesso Negado!" });
  }

  const decoded = await jwt.verify(token, `${secretKey}`);

  const idUsuario = decoded.id;

  const usuario = await Usuario.findOne({ where: { idUsuario: idUsuario } });

  return usuario;
};

module.exports = pegaUsuarioToken;
