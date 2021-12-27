import express from 'express';
import * as endpoints from './endpoints';
import {pool, CREDENTIAL} from './globals';

const port = process.env.PORT ?? 8000;


// server
const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

endpoints.getWeather(app, pool);
endpoints.setWeather(app, pool);
endpoints.clearRecords(app, pool);
endpoints.getRaw(app, pool);
endpoints.setRaw(app, pool);

app.listen(port, () => console.log(`server started at http://localhost:${port}`));
