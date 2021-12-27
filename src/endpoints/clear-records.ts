import {Express} from 'express';
import {Pool} from 'pg';
import {CREDENTIAL} from '../globals';

export default function(app: Express, pool: Pool) {
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

  app.post('/clear-records', (req, res) => {
    const cred = req.headers.credential;
    if (CREDENTIAL === cred) {
      clearFiles();
      res.status(200).send('records cleared');
    } else {
      res.status(400).send('incorrect credential');
    }
  });
}
