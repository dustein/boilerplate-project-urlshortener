require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

//////////////minhas config/////////////////
const mongoose = require('mongoose');
const mongodb = require('mongodb');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

////////////// Fim minhas config ------------

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//inicio meu código

const Schema = mongoose.Schema

const linksSchema = new Schema({
  original: {type: String, required: true},
  encurtado: {type: Number}
})

//CRIA COLLECTION NO DATABASE/////////////////////////
const Bancourl = mongoose.model('Bancourl', linksSchema)
//---------------------------------------------------

bodyParser = require('body-parser');
//pegar o formulário input
let pegaInput = bodyParser.urlencoded({ extended: false })

let resposta = {}
//Para testar a url postada /////////////////////////
const dns = require('dns')
//---------------------------------------------------
//PEGAR LINK POSTADO/////////////////////////////////
app.post(
  "/api/shorturl",
  pegaInput,
  (req, res) => {
    //o parser vai pegar o que foi postado no input url
    let linkPostado = req.body.url
        
    //testar para ver se é uma url válida
    let urlRegex = new RegExp( /^[http://www.]/gi)
    // let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
    if(!linkPostado.match(urlRegex)){
      res.json({error: 'invalid url'})
	    return
}
    //-----------------------
    //VERIFICAR SE JA TEM A URL CADASTRADA/////////
    //?
//     const buscaUrlBanco = function(linkPostado, done) {
//   Bancourl.find({name: linkPostado}, function(err, linkEncontrado) {
//     if (err) return console.log(err)
//     console.log(personFound)
//     done(null, linkEncontrado);
//   })  
// }
//     if(buscaUrlBanco(linkPostado)) {
//       resposta['original_url'] = "AHHHHH"
//     }
    //------------------------------------------
    resposta['original_url'] = linkPostado
    
    





    //url encurtada

    // resposta['short_url'] = 1
    
    let linkCurto = 1
    //coloca em ordem decrescente do valor do link encurtado para acharmos o maior valor
    Bancourl
    .findOne({})
    .sort({ encurtado: "desc" })
    //e atribuimos o número seguinte pro novo link encurtado
    .exec((error, valor) => {

      if (!error && valor != undefined) {
        linkCurto = valor.encurtado + 1;
      }

      if (!error) {
    
    //1º parametro verifica se já existe o link original no banco
    //2º parametro define os valores do original e encurtado
    //3º parametro opção new retorna o novo documento para repsosta,
    //   upsert para criar o documento caso ainda não exista.
        Bancourl.findOneAndUpdate(
          { original: linkPostado },
          { original: linkPostado, encurtado: linkCurto },
          { new: true, upsert: true },
          //e finalmente, uma callback para definir o valor do link encurtado conforme definido
          (error, urlSalva) => {
            if (!error) {
              resposta["short_url"] = urlSalva.encurtado;
              //e finalmente retorna a respota
              res.json(resposta);
            }
          }
        );
      }

    });
//



//GRAVA O NOVO LINK DA COLLECTION///////////
  let novoLink = new Bancourl(
  {
    original: linkPostado,
    encurtado: linkCurto
  }
)
novoLink.save((erro, salvo) => {
  if(erro) {
    console.log(erro)
  } console.log("novo link salvo: " + linkPostado)
})
//-------------------------------------------
  }
)


//REDIRECIONA O LINK CURTO PRO ORIGINAL/////////////////
app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  Bancourl.findOne({encurtado: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json('URL not Found')
      console.log(error)
    }
  })
})
//--------------------------------------------------------
