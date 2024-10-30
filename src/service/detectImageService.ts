import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs-node';

import { Tensor3D } from '@tensorflow/tfjs';

tf.enableProdMode();

export class DetectImageService {
    #model?: nsfwjs.NSFWJS;

    async #getModel(): Promise<nsfwjs.NSFWJS> {
        if (!this.#model) {
            if (process.env.NSFWJSAPI_ENABLE_REMOTE_MODEL) {
                this.#model = await nsfwjs.load(process.env.NSFWJSAPI_REMOTE_MODEL_ENDPOINT);
            } else {
                this.#model = await nsfwjs.load('file://./src/model/inception_v3/model.json', {size: 299});
            }
        }

        return this.#model;
    }

    #formatData(data: { className: string; probability: number }[]): Record<string, number> {
        const result: Record<string, number> = {};

        for (const item of data) {
            result[item.className.toLowerCase()] = item.probability;
        }

        return result;
    }

    async detect(imageBuffer: Buffer) {
        const [model, content] = await Promise.all([
            this.#getModel(),
            tf.node.decodeImage(imageBuffer, 3),
        ]);

        const predictions = await model.classify(content as Tensor3D);
        content.dispose();

        return this.#formatData(predictions);
    }

    async batchDetect(imageBuffer: Buffer[]) {

        return await Promise.all(imageBuffer.map(buffer => this.detect(buffer)));
    }
}
