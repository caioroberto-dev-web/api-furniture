//IMPORTA JSON WEB TOKEN
const jwt = require("jsonwebtoken");

const criaUsuarioToken = (usuario, req, res) => {
  //VARIÁVEL DE AMBIENTE
  const secretKey = process.env.SECRETKEY;

  console.log("Usuario", usuario);

  if (!secretKey) {
    return res.status(500).json({ message: "Chave secreta não definida" });
  }

  try {
    //CRIA TOKEN
    const token = jwt.sign(
      {
        nome: usuario.nome,
        id: usuario.idUsuario,
      },
      secretKey,
      {
        expiresIn: 3600,
      }
    );
    console.log("Token:", token);
    //RETORNA TOKEN
    res.status(201).json({
      message: "Usuário autenticado com sucesso!",
      token: token,
      idUsuario: usuario.idUsuario,
      nome: usuario.nome,
      image: usuario.image,
      loggedIn: true,
    });
  } catch (error) {
    console.error("Error ao criar token: ", error);
    res
      .status(500)
      .json({ message: "Erro ao criar o token", error: error.message });
  }
};

module.exports = criaUsuarioToken;
