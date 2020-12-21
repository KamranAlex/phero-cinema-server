const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;
const ObjectID = require('mongodb').ObjectID;

app.get('/', (req, res) => {
  res.send('Welcome! P-hero Cinema');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lkrgo.mongodb.net/pheroCinema?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const moviesCollection = client.db('pheroCinema').collection('moviesList');

  //Add new Movie to database
  app.post('/addMovie', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const date = req.body.date;
    const time = req.body.time;

    //encodeing Image
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64'),
    };

    moviesCollection.insertOne({ title, date, time, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // Get Movies from database
  app.get('/movies', (req, res) => {
    moviesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Get A Single Movie
  app.get('/getMovieInfo/:id', (req, res) => {
    moviesCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
});

app.listen(process.env.PORT || port, () => {
  console.log('Server is Running Perfectly');
});
