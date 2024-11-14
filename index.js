//IMPORTA EXPRESS
const express = require("express");
const cors = require("cors");

//VARIÁVEL DE AMBIENTE
require("dotenv/config");

const porta = process.env.PORTA;
const origin_ip = process.env.ORIGIN_IP;

//IMPORTA CONEXÃO COM O BANCO
const conn = require("./db/conn");

//MODELS
const Usuario = require("./models/Usuario");
const Movel = require("./models/Movel");

//CONTROLLERS
const UsuarioController = require("./controllers/UsuarioController");
const MoveisController = require("./controllers/MoveisController");

//ROUTES
const routesUsuario = require("./routes/routesUsuario");
const routesMovel = require("./routes/routesMovel");

//INVOCA EXPRESS
const app = express();

//SOLUCIONA PROBLEMA DE CORS
app.use(cors({ credentials: true, origin: origin_ip }));

//RECEBANDO DADOS VIA JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//ARQUIVOS ESTÁTICOS DO SERVIDOR
app.use(express.static("public"));

//ROTAS
app.use("/usuario", cors(), routesUsuario);
app.use("/moveis", cors(), routesMovel);

//EXECUTANDO API
conn
  // FORÇA API A RECRIAR O BANCO DO ZERO
  //.sync({ force: true })
  .sync()
  .then(() => {
    app.listen(porta);
    console.log("Rodando na porta: ", porta);
  })
  .catch((err) => {
    console.log(err);
  });
