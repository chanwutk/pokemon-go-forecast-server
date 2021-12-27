import {Express} from 'express';
import {pool} from '../globals';

export default function(app: Express) {
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
}
