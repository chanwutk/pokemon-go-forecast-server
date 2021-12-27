import {Express} from 'express';
import {Pool} from 'pg';
import {CREDENTIAL, INIT_FILE, RAW_NAME} from '../globals';

export default function(app: Express, pool: Pool) {
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
}
