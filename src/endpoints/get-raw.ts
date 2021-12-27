import {Express} from 'express';
import {INIT_FILE, pool, RAW_NAME} from '../globals';

export default function(app: Express) {
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
}
