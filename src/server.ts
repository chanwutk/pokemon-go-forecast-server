import express from 'express';
import * as endpoints from './endpoints';

const port = process.env.PORT ?? 8000;

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

endpoints.getWeather(app);
endpoints.setWeather(app);
endpoints.clearRecords(app);
endpoints.getRaw(app);
endpoints.setRaw(app);

app.listen(port, () => console.log(`server started at http://localhost:${port}`));
