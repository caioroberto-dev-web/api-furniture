//IMPORTA JSON WEB TOKEN
const jwt = require("jsonwebtoken");

//IMPORTA HELPERS - PEGA TOKEN
const pegaToken = require("./pega-token");

//VARIÁVEL DE AMBIENTE
const secretKey = process.env.SECRETKEY;

//MIDDLE PARA VALIDAÇÃO DE TOKEN
const checaUsuarioToken = (req, res, next) => {
  //IF TRATA SE TEM OU NÃO AUTORIZAÇÃO
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso Negado!" });
  }

  const token = pegaToken(req);

  //IF TRATA SE TEM OU NÃO O TOKEN
  if (!token) {
    return res.status(401).json({ message: "Acesso Negado!" });
  }

  try {
    const verificado = jwt.verify(token, `${secretKey}`);

    req.usuario = verificado;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token Inválido" });
  }
};

module.exports = checaUsuarioToken;
