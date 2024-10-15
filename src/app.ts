import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';

import { ControllersLoader } from 'simple-ts-express-decorators';
import { ImageDetectController } from "app/controller/ImageDetectController";

const app = express()

app.use(compression());
app.use(express.json());
app.use(bodyParser.json());

new ControllersLoader({
    controllers: [ImageDetectController],
}).load(app);

app.listen(process.env.NSFWJSAPI_PORT || 3000);
