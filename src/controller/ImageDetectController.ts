import multer from 'multer';

import { createHash } from 'crypto';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import { Controller, Post } from 'simple-ts-express-decorators';
import { NSFWDetectService } from 'app/service/nsfwjsDetectService';

const upload = multer({storage: memoryStorage()});

interface DetectResponse {
    source: string;
    res: any;
    err: string;
}

@Controller()
export class ImageDetectController {
    detector: NSFWDetectService;

    constructor() {
        this.detector = new NSFWDetectService();
    }

    @Post('/classify/data', upload.array('image'))
    async batchDetectWithContent(req: Request, res: Response<DetectResponse[]>) {
        if (!req.files) {
            return res.status(400).json([{ source: '', res: {}, err: 'missing image multipart/form-data'}]);
        }

        const allDetectRes: DetectResponse[] = [];
        await Promise.all(
            (req.files as Express.Multer.File[]).map(async (file) => {
                const md5Hash = createHash('md5').update(file.buffer).digest('hex');
                try {
                    const detectRes = await this.detector.detect(file.buffer);
                    allDetectRes.push({ source: md5Hash, res: detectRes, err: '' });
                } catch (error) {
                    allDetectRes.push({ source: md5Hash, res: {}, err: `Error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(allDetectRes);
    }

    @Post('/classify/url')
    async batchDetectWithURL(req: Request, res: Response<DetectResponse[]>) {
        const { url } = req.body;
        if (!url || !Array.isArray(url) || !url.length) {
            return res.status(400).json([{ source: '', res: {}, err: 'Missing image url' }]);
        }

        const detectRes: DetectResponse[] = [];
        await Promise.all(
            url.map(async (single: string) => {
                try {
                    const imageContent = await fetch(single);
                    if (!imageContent.ok) {
                        detectRes.push({ 
                            source: single, 
                            res: {}, 
                            err: `Failed to fetch image from url status: ${imageContent.status}` 
                        });
                        return;
                    }
                    const buffer = Buffer.from(await imageContent.arrayBuffer());
                    const singleDetectRes = await this.detector.detect(buffer);
                    detectRes.push({ source: single, res: singleDetectRes, err: '' });
                } catch (error) {
                    detectRes.push({ source: single, res: {}, err: `Error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(detectRes);
    }
}
