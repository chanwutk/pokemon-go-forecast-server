import {Express} from 'express';
import {Pool} from 'pg';
import {CREDENTIAL} from '../globals';

export default function(app: Express, pool: Pool) {
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
}
