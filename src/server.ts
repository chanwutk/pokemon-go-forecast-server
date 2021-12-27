import express from 'express';
import {Pool} from 'pg';

const CREDENTIAL = process.env.CREDENTIAL;
const DB_URL = process.env.DATABASE_URL;
const port = process.env.PORT ?? 8000;

const RAW_NAME = (id: string) => `raw_${id}`;

// server
const app = express();

// database
const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

const INIT_FILE = JSON.stringify(new Array(24).fill(null));

function clearFiles() {
  pool
    .query('DROP TABLE IF EXISTS files')
    .then(() => {
      console.log('table dropped: files');
      pool
        .query('CREATE TABLE files (name VARCHAR(20) PRIMARY KEY, data TEXT)')
        .then(() => {
          console.log('created table: files');
        });
    });
}

app.get('/weather', (_req, res) => {
  pool
    .query("SELECT * FROM files WHERE name = 'weather';")
    .then(result => {
      if (result.rowCount === 0) {
        console.log('no weather found');
        res.status(200).send('[]');
      } else if (result.rowCount === 1) {
        console.log('found weather');
        res.status(200).send(result.rows[0]['data']);
      } else {
        res.status(500).send('database contains multiple weather');
      }
    })
    .catch(error => {
      res.status(500).send('query error: ' + error);
    })
});

app.get('/raw', (req, res) => {
  if (typeof req.query.id !== 'string') {
    res.status(400).send('must provide id');
    return;
  }

  const rawFile = RAW_NAME(req.query.id);
  pool
    .query("SELECT * FROM files WHERE name = $1", [rawFile])
    .then(result => {
      if (result.rowCount === 0) {
        res.status(200).send(INIT_FILE);
      } else if (result.rowCount === 1) {
        res.status(200).send(result.rows[0]['data']);
      } else {
        res.status(500).send('database contains multiple weather');
      }
    })
    .catch(error => {
      res.status(500).send('query error: ' + error);
    })
});

app.post('/modify-weather', (req, res) => {
  const cred = req.headers.credential;
  const data = req.body.data ?? '[]';
  if (CREDENTIAL === cred) {
    pool
      .query("DELETE FROM files WHERE name = 'weather'")
      .then(() => {
        pool
          .query("INSERT INTO files (name, data) VALUES ('weather', $1)", [data])
          .then(() => res.status(200).send('weather modified'))
          .catch(error => res.status(500).send('insert fail: ' + error))
      })
      .catch(error => res.status(500).send('delete fail: ' + error))
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
  const data = req.body.data ?? INIT_FILE;
  const rawFile = RAW_NAME(req.body.id);
  if (CREDENTIAL === cred) {
    pool
      .query("DELETE FROM files WHERE name = $1", [rawFile])
      .then(() => {
        pool
          .query("INSERT INTO files (name, data) VALUES ($1, $2)", [rawFile, data])
          .then(() => res.status(200).send('raw modified'))
          .catch(error => res.status(500).send('insert fail: ' + error))
      })
      .catch(error => res.status(500).send('delete fail: ' + error))
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
