const express = require('express');
const fs = require('fs');

const CREDENTIAL = process.env.CREDENTIAL;
const WEATHER_FILE = './weather.json';
const RAW_FILE = id => `./raw_${id}.json`;

// server
const app = express();
const port = process.env.PORT ?? 8000;

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

function createFile(file) {
  fs.writeFile(file, '[]', err => {
    if (err) console.error(err);
    console.log('created: ' + file);
  });
}

function clearFiles() {
  if (fs.existsSync(WEATHER_FILE)) {
    fs.unlinkSync(WEATHER_FILE);
  }
  fs.readdirSync('.')
    .filter(f => /^raw_.*[.]json$/.test(f))
    .forEach(f => fs.unlinkSync(f));
}

clearFiles();

app.get('/', (_req, res) => {
  if (!fs.existsSync(WEATHER_FILE)) {
    createFile(WEATHER_FILE);
  }
  fs.readFile(WEATHER_FILE, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.toString());
    }
  });
});

app.get('/raw', (req, res) => {
  if (req.query.id === undefined) {
    res.status(400).send('must provide id');
    return;
  }

  const rawFile = RAW_FILE(req.query.id);
  if (!fs.existsSync(rawFile)) {
    createFile(rawFile);
  }
  fs.readFile(rawFile, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.toString());
    }
  });
});

app.post('/modify-weather', (req, res) => {
  const cred = req.headers.credential;
  const data = req.body.data ?? '[]';
  if (CREDENTIAL === cred) {
    fs.writeFile(WEATHER_FILE, data, err => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('weather modified');
      }
    });
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.post('/modify-raw', (req, res) => {
  if (req.body.id === undefined) {
    res.status(400).send('must provide id');
    return;
  }

  const cred = req.headers.credential;
  const data = req.body.data ?? '[]';
  const rawFile = RAW_FILE(req.body.id);
  if (CREDENTIAL === cred) {
    fs.writeFile(rawFile, data, err => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('raw weather modified');
      }
    });
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.post('/clear-records', (req, res) => {
  const cred = req.headers.credential;
  if (CREDENTIAL === cred) {
    clearFiles();
    res.status(200).send('records cleared');
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.listen(port, () => console.log(`server started at http://localhost:${port}`));
