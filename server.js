const express = require('express');
const fs = require('fs');

const CREDENTIAL = process.env.CREDENTIAL;
const WEATHER_FILE = './weather.json';
const RAW_FILE = './raw.json';

// server
const app = express();
const port = 8000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

function createFile(file) {
  fs.appendFile(file, '', (err) => {
    if (err) console.error(err);
    fs.writeFile(file, '', err => {
      if (err) console.error(err);
      console.log('created: ' + file);
    });
  });
}

createFile(WEATHER_FILE);
createFile(RAW_FILE);

app.get('/', (_req, res) => {
  fs.readFile(WEATHER_FILE, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.toString());
    }
  });
});

app.get('/raw', (_req, res) => {
  fs.readFile(RAW_FILE, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.toString());
    }
  });
});

app.post('/modify-weather', (req, res) => {
  const cred = req.body.cred;
  if (CREDENTIAL === cred) {
    fs.writeFile(WEATHER_FILE, req.body.data, err => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('records cleared');
      }
    });
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.post('/modify-raw', (req, res) => {
  const cred = req.body.cred;
  if (CREDENTIAL === cred) {
    fs.writeFile(RAW_FILE, res.body.data, err => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('records cleared');
      }
    });
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.post('/clear-records', (req, res) => {
  const cred = req.body.cred;
  if (CREDENTIAL === cred) {
    createFile(WEATHER_FILE);
    createFile(RAW_FILE);
    res.status(200).send('records cleared');
  } else {
    res.status(400).send('incorrect credential');
  }
});

app.listen(port, () => console.log(`server started at http://localhost:${port}`));