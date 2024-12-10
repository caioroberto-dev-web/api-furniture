//IMPORTANDO MODEL MOVEIS
const Movel = require("../models/Movel");

//const Usuario = require("../models/Usuario");

//HELPERS
const pegaToken = require("../helpers/pega-token");
const pegaUsuarioToken = require("../helpers/pega-usuario-token");

//VARIÁVEL DE AMBIENTE
const servidor_ip = process.env.SERVIDOR_IP;

module.exports = class MoveisController {
  //CADASTRO
  static async cadastro(req, res) {
    let images = [];

    let {
      nomeProduto,
      condicao,
      cor,
      descricao,
      preco,
      image,
      nomeVendedor,
      telefoneVendedor,
    } = req.body;

    let situacao = true;

    //TENTAR PEGAR O ID DO USUARIO AUTENTICADO
    //CHECA SE O USUÁRIO EXISTE PEGANDO O TOKEN
    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);

    let idUsuario = usuario.idUsuario;

    //VALIDA CAMPOS
    if (!nomeProduto) {
      res.status(422).json({ message: "Campo nome do produto é obrigatório!" });
      return;
    }
    if (!condicao) {
      res.status(422).json({ message: "Campo condição é obrigatório!" });
      return;
    }
    if (!cor) {
      res.status(422).json({ message: "Campo cor é obrigatório!" });
      return;
    }
    if (!descricao) {
      res.status(422).json({ message: "Campo descrição é obrigatório!" });
      return;
    }
    if (!preco) {
      res.status(422).json({ message: "Campo preço é obrigatório!" });
      return;
    }

    if (!req.files) {
      res.status(422).json({ message: "Insira uma foto do produto!" });
      return;
    }

    req.files.forEach((file) => {
      const imageUrl = `${servidor_ip}/image/moveis/${file.filename}`;
      // Adicione a imageUrl a um array de imagens
      images.push({
        filename: file.filename,
        url: imageUrl,
      });
    });

    image = `${servidor_ip}/image/moveis/${req.files.filename}`;

    // CRIA OBJETO MOVEL
    const movel = {
      nomeProduto,
      condicao,
      cor,
      descricao,
      preco,
      situacao,
      image: images,
      nomeVendedor: usuario.nome,
      telefoneVendedor: usuario.telefone,
      idUsuario,
    };

    await Movel.create(movel);

    res.status(201).json({ message: "Movel cadastrado com sucesso!" });
  }

  //ROTA PUBLICA MOSTRA TODOS OS MOVEIS DISPONÍVEIS A VENDA DOS USUARIOS.
  static async pegaTodosMoveis(req, res) {
    const moveis = await Movel.findAll();

    res.status(200).json({ moveis: moveis });
  }

  //PEGA TODOS OS MEUS MOVEIS DISPONIVEIS PRA VENDA
  static async pegaTodosMeusMoveis(req, res) {
    //PEGA TOKEN DO USUÁRIO
    const token = pegaToken(req);

    //PEGA TOKEN DO USUÁRIO PARA USAR COMO PARAMETRO PARA REGATE DOS MOVEIS INVIDUALMENTE
    let pegaMoveisUsuario = await pegaUsuarioToken(token);

    //==> novoUsuario = RECEBE O ID ATUAL DO USUÁRIO LOGADO NO SISTEMA POR MEIO DO TOKEN
    let novoValor = await pegaMoveisUsuario.idUsuario;

    const movel = await Movel.findAll({ where: { idUsuario: novoValor } });

    res.status(200).json({ movel });
  }

  //===================== PEGA TODOS MOVEIS QUE DESEJO COMPRAR ====================//
  static async pegaMoveisQueroComprar(req, res) {
    //PEGA TOKEN DO USUÁRIO
    const token = pegaToken(req);

    //PEGA TOKEN DO USUÁRIO PARA USAR COMO PARAMETRO PARA REGATE DOS MOVEIS INVIDUALMENTE
    let pegaMoveisUsuario = await pegaUsuarioToken(token);

    //==> novoUsuario = RECEBE O ID ATUAL DO USUÁRIO LOGADO NO SISTEMA POR MEIO DO TOKEN
    let idUsuario = await pegaMoveisUsuario.idUsuario;

    const movel = await Movel.findAll({
      where: { idComprador: idUsuario },
      raw: true,
    });

    res.json({ movel });
  }

  //================ PEGA DETALHES DO MOVEL POR ID ================ //
  static async pegaMovelId(req, res) {
    const idMovel = req.params.id;

    //CHECA SE O MOVEL EXISTE
    const movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    res.status(200).json({ movel: movel });
  }

  //================= ROTA DELETE MOVEL ================= //
  static async removeMovelId(req, res) {
    const idMovel = req.params.id;

    //CHECA SE O MOVEL EXISTE
    const movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    //CHECA SE O USUÁRIO LOGADO REGISTROU O MOVEL, PARA EVITAR DE REMOVER O MOVEL DO OUTRO

    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);

    //CHECA O ID, PARA VER SER SÃO DIFERENTES, SE FOR CAI NO IF ABAIXO

    if (movel.idUsuario !== usuario.idUsuario) {
      res.status(422).json({
        message:
          "Houve um erro ao tentar processar a sua solicitação, tente novamente em outro momento!",
      });
      return;
    }

    await Movel.destroy({ where: { idMovel: idMovel } });

    res.status(200).json({ message: "Movel removido com sucesso!" });
  }

  //================= ATUALIZA MOVEL ================= //
  static async atualizaMovel(req, res) {
    let imagesAtt = [];

    const idMovel = req.params.id;

    let {
      nomeProduto,
      condicao,
      descricao,
      cor,
      preco,
      image,
      nomeVendedor,
      telefoneVendedor,
      situacao,
    } = req.body;

    const updatedData = {};

    //!===== CHECA SE O MOVEL EXISTE! =====//
    const movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    //!===== CHECA SE O USUÁRIO LOGADO REGISTROU O MOVEL! =====//
    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);

    if (movel.idUsuario !== usuario.idUsuario) {
      res.status(422).json({
        message:
          "Houve um erro ao tentar processar a sua solicitação, tente novamente em outro momento!",
      });
      return;
    }

    //CAMPO DE VALIDAÇÃO DE EDIÇÃO DE FORMULÁRIO

    if (nomeProduto) {
      updatedData.nomeProduto = nomeProduto;
    }

    if (condicao) {
      updatedData.condicao = condicao;
    }

    if (descricao) {
      updatedData.descricao = descricao;
    }

    if (cor) {
      updatedData.cor = cor;
    }

    if (preco) {
      updatedData.preco = preco;
    }

    if (req.files.length > 0) {
      if (req.files) {
        image = `${servidor_ip}/image/moveis/${req.files.filename}`;
        updatedData.image = imagesAtt;
      }

      req.files.forEach((file) => {
        const imageUrl = `${servidor_ip}/image/moveis/${file.filename}`;
        // Adicione a imageUrl a um array de imagens
        imagesAtt.push({
          filename: file.filename,
          url: imageUrl,
        });
      });
    }

    if (nomeVendedor) {
      updatedData.nomeVendedor = nomeVendedor;
    }

    if (telefoneVendedor) {
      updatedData.telefoneVendedor = telefoneVendedor;
    }

    await movel.update(updatedData);

    res.status(200).json({
      message:
        "Movel atualizado com sucesso! Foram atualizados os seguites dados:",
      dados: updatedData,
    });
  }

  //=========== ROTA DE MARCAR A COMPRAR DO MOVEL =========== //
  static async desejoComprar(req, res) {
    const idMovel = req.params.id;

    let {
      nomeProduto,
      condicao,
      descricao,
      cor,
      preco,
      imagem,
      situacao,
      nomeVendedor,
      telefoneVendedor,
      idComprador,
      nomeComprador,
      telefoneComprador,
    } = req.body;

    //CHECA SE O MOVEL EXISTE
    let movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    //!===== CHECA SE O PROPRIO USUÁRIO TENTA COMPRAR O MOVEL QUE COLOCOU A VENDA! =====//
    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);
    console.log(movel.idUsuario);
    console.log(usuario.idUsuario);
    if (movel.idUsuario == usuario.idUsuario) {
      res.status(422).json({
        message: "Você não pode comprar um movel que você mesmo registrou!",
      });

      return;
    }

    //CHECA SE O USUÁRIO JÁ MOSTROU INTERESSE DE COMPRAR O MOVEL

    if (movel.idComprador == usuario.idUsuario) {
      res.status(422).json({
        message: "Você já demostrou interesse de comprar este movel!",
      });

      return;
    }

    //ADICIONA O USUÁRIO COMO POSSÍVEL COMPRADOR DO MOVEL
    movel.comprador = {
      idComprador: usuario.idUsuario,
      nomeComprador: usuario.nome,
      telefoneComprador: usuario.telefone,
    };

    await Movel.update(movel.comprador, { where: { idMovel: idMovel } });

    res.status(200).json({
      message: `Pedido de compra enviado com sucesso, por favor espere o contato de ${movel.nomeVendedor}, pelo número ${movel.telefoneVendedor}`,
    });
  }

  //================= CANCELA VENDA ================= //

  static async cancelaVenda(req, res) {
    const idMovel = req.params.id;

    let {
      nomeProduto,
      condicao,
      descricao,
      cor,
      preco,
      imagem,
      idComprador,
      nomeVendedor,
      telefoneVendedor,
      situacao,
    } = req.body;

    const updatedData = {};

    //!===== CHECA SE O MOVEL EXISTE! =====//
    const movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    //!===== CHECA SE O USUÁRIO LOGADO REGISTROU O MOVEL! =====//
    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);

    if (movel.idUsuario !== usuario.idUsuario) {
      res.status(422).json({
        message:
          "Houve um erro ao tentar processar a sua solicitação, tente novamente em outro momento!",
      });
      return;
    }

    //CAMPO DE VALIDAÇÃO DE EDIÇÃO DE FORMULÁRIO

    updatedData.nomeProduto = movel.nomeProduto;

    updatedData.condicao = movel.condicao;

    updatedData.descricao = movel.descricao;

    updatedData.cor = movel.cor;

    updatedData.preco = movel.preco;

    updatedData.imagem = movel.imagem;

    //CAMPO PARA CANCELAR VENDA

    idComprador = null;
    let nomeComprador = null;
    let telefoneComprador = null;

    updatedData.idComprador = idComprador;
    updatedData.nomeComprador = nomeComprador;
    updatedData.telefoneComprador = telefoneComprador;

    await movel.update(updatedData);

    res.status(200).json({
      message: "Venda cancelada com sucesso!",
      dados: updatedData,
    });
  }

  //CONCLUI A VENDA DO MOVEL
  static async compraConcluida(req, res) {
    const idMovel = req.params.id;

    //CHECA SE O MOVEL EXISTE
    let movel = await Movel.findOne({ where: { idMovel: idMovel } });

    if (!movel) {
      res.status(404).json({ message: "Movel não encontrado!" });
      return;
    }

    //!===== CHECA SE O USUÁRIO LOGADO REGISTROU O MOVEL! =====//
    const token = pegaToken(req);
    const usuario = await pegaUsuarioToken(token);

    if (movel.idUsuario !== usuario.idUsuario) {
      res.status(422).json({
        message:
          "Houve um erro ao tentar processar a sua solicitação, tente novamente em outro momento!",
      });
      return;
    }

    if (movel.situacao == false) {
      res.status(422).json({ message: "Você já vendeu este móvel!" });
      return;
    }

    movel.situacao = false;

    movel.vendedor = {
      situacao: movel.situacao,
    };

    await Movel.update(movel.vendedor, { where: { idMovel: idMovel } });

    res.status(200).json({
      message: "Parabéns! A venda do movel foi concluida com sucesso!",
    });
  }
};
