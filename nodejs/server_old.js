require('dotenv/config')
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
//adição sobre o.env para o dockercompose
var port = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})
var {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;


//var dbUrl = 'mongodb+srv://admin:25081963a@cluster-ezops.aivkn.mongodb.net/<simple-chat>?retryWrites=true&w=majority'
const dbUrl = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?retryWrites=true&w=majority`

console.log(dbUrl);

const options = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
  useUnifiedTopology: true
};

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})

io.on('connection', () =>{
  console.log('usuario conectado')
})
//connect antigo

/*
mongoose.connect(dbUrl ,(err) => {
  console.log('mongodb connected',err);
})
*/
//connecthigor
/*mongoose.connect(dbUrl, options).then( function() {
console.log('MongoDB is connected');
})
  .catch( function(err) {
  console.log(err);
});
*/
//connectalan

mongoose.connect(dbUrl, options, (err) => {
  console.log('MongoDB is connected')
  if (err) {
    throw new Error(err)
  }
})

const server = http.listen(3000, () => {
  console.log('server executando na porta', server.address().port);
});

