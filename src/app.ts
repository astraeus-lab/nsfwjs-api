import express from 'express';
import compression from 'compression';

import { ControllersLoader } from 'simple-ts-express-decorators';
import { ImageDetectController } from "./controller/ImageDetectController";

const app = express()

app.use(compression());
app.use(express.json());

new ControllersLoader({
    controllers: [ImageDetectController],
}).load(app);

app.listen(process.env.NSFWJSAPI_PORT || 3000);
