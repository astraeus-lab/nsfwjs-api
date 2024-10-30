import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';

import { ControllersLoader } from 'simple-ts-express-decorators';
import { ImageDetectController } from "app/controller/ImageDetectController";

const app = express()

app.use(cors());
app.use(compression());
app.use(bodyParser.json({limit: '64mb'}));
app.use(bodyParser.urlencoded({limit: '64mb', extended: true }));

new ControllersLoader({
    controllers: [ImageDetectController],
}).load(app);

app.listen(process.env.NSFWJSAPI_PORT || 80);
