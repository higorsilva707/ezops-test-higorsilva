require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const Message = mongoose.model('Message', {
  name: String,
  message: String
})

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const dbUrl = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
};

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})

app.get('/messages/:user', (req, res) => {
  const user = req.params.user
  Message.find({ name: user }, (err, messages) => {
    res.send(messages);
  })
})

app.post('/messages', async (req, res) => {
  try {
    const message = new Message(req.body);

    const savedMessage = await message.save()
    console.log('saved');

    const censored = await Message.findOne({ message: 'badword' });
    if (censored)
      await Message.remove({ _id: censored.id })
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  }
  catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  }
  finally {
    console.log('Message Posted')
  }
})

app.post('/messages/clear', (req, res) => {
  Message.deleteMany({}, (err, messages) => {
    res.send(messages)
  })
})

io.on('connection', () => {
  console.log(`a user is connected`)
})

mongoose.connect(dbUrl, options, (err) => {
  console.log('MongoDB is connected')

  if (err) {
    throw new Error(err)
  }
})

const server = http.listen(3000, () => {
  console.log('Server is running on port', server.address().port);
});
