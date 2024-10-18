import { Request, Response } from 'express';
import { Controller, Post } from 'simple-ts-express-decorators';
import { NSFWDetectService } from 'app/service/nsfwjsDetectService';

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

    @Post('/classify/data')
    async batchDetectWithContent(req: Request, res: Response<DetectResponse[]>) {
        const source = req.body.source;
        if (!source || !Array.isArray(source) || source.length === 0) {
            return res.status(400).json([{ source: '', res: {}, err: 'missing image data in request body' }]);
        }

        const allDetectRes: DetectResponse[] = [];
        await Promise.all(
            source.map(async (single: {udid: string, data: string}) => {
                const imageUDID = single.udid || single.data;
                try {
                    const detectRes = await this.detector.detect(Buffer.from(single.data, 'base64'));
                    allDetectRes.push({ source: imageUDID, res: detectRes, err: '' });
                } catch (error) {
                    allDetectRes.push({ source: imageUDID, res: {}, err: `error detecting image: ${(error as Error).message}` });
                }
            })
        );
    
        return res.json(allDetectRes);
    }

    @Post('/classify/url')
    async batchDetectWithURL(req: Request, res: Response<DetectResponse[]>) {
        const source = req.body.source;
        if (!source || !Array.isArray(source) || !source.length) {
            return res.status(400).json([{ source: '', res: {}, err: 'missing image url in request body' }]);
        }

        const detectRes: DetectResponse[] = [];
        await Promise.all(
            source.map(async (single: {udid: string, data: string}) => {
                const imageUDID = single.udid || single.data;
                try {
                    const imageContent = await fetch(single.data);
                    if (!imageContent.ok) {
                        detectRes.push({ 
                            source: imageUDID,
                            res: {}, 
                            err: `failed to fetch image from url status: ${imageContent.status}` 
                        });
                        return;
                    }
                    const singleDetectRes = await this.detector.detect(Buffer.from(await imageContent.arrayBuffer()));
                    detectRes.push({ source: imageUDID, res: singleDetectRes, err: '' });
                } catch (error) {
                    detectRes.push({ source: imageUDID, res: {}, err: `error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(detectRes);
    }
}
