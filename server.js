require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

const Message = mongoose.model('Message',{
  name : String,
  message : String
})


const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const dbUrl = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
console.log(dbUrl);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
};


//const dbUrl = 'mongodb://amkurian:amkurian1@ds257981.mlab.com:57981/simple-chat'
//const dbUrl = 'mongodb+srv://admin:25081963a@cluster-ezops.aivkn.mongodb.net/<simple-chat>?retryWrites=true&w=majority'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})




app.get('/messages/:user', (req, res) => {
  const user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    const message = new Message(req.body);

    const savedMessage = await message.save()
      console.log('saved');

    const censored = await Message.findOne({message:'badword'});
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

app.post('/messages/clear', (req, res) => {
  Message.deleteMany({}, (err, messages) => {
    res.send(messages)
  })
})


io.on('connection', () =>{
  console.log('a user is connected')
})

/*
mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
  console.log('mongodb connected',err);
})
*/
mongoose.connect(dbUrl, options)
  .then(() => console.log('MongoDB is connected'))
  .catch((error) => {
    console.error(error)
  })

const server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
