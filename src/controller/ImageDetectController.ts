import multer from 'multer';

import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import { Controller, Post } from 'simple-ts-express-decorators';
import { NSFWDetectService } from 'app/service/nsfwjsDetectService';

const upload = multer({storage: memoryStorage()});

interface DetectResponse {
    res: any;
    err: string;
}

@Controller()
export class ImageDetectController {
    detector: NSFWDetectService;

    constructor() {
        this.detector = new NSFWDetectService();
    }

    @Post('/single/content/detect', upload.single('image'))
    async singleDetectWithContent(req: Request, res: Response<DetectResponse[]>) {
        if (!req.file) {
            return res.status(400).json([{ res: {}, err: 'Missing image multipart/form-data'}]);
        }

        try {
            const detectRes = await this.detector.detect(req.file.buffer)
            return res.json([{ res: detectRes, err: '' }]);
        } catch(error) {
            return res.json([{ res: {}, err: `Error detecting image: ${(error as Error).message}`}])
        }
    }

    @Post('/batch/content/detect', upload.array('imageList'))
    async batchDetectWithContent(req: Request, res: Response<DetectResponse[]>) {
        if (!req.file) {
            return res.status(400).json([{ res: {}, err: 'missing image list multipart/form-data'}]);
        }

        const allDetectRes: DetectResponse[] = [];
        await Promise.all(
            (req.files as Express.Multer.File[]).map(async (file) => {
                try {
                    const detectRes = await this.detector.detect(file.buffer);
                    allDetectRes.push({ res: detectRes, err: '' });
                } catch (error) {
                    allDetectRes.push({ res: {}, err: `Error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(allDetectRes);
    }

    @Post('/single/url/detect', upload.single('image'))
    async singleDetectWithURL(req: Request, res: Response<DetectResponse[]>) {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json([{ res: {}, err: 'Missing image url' }]);
        }

        try {
            const imageResp = await fetch(url);
            if (!imageResp.ok) {
                throw new Error(`Failed to fetch image from (${url}) status: ${imageResp.status}`);
            }

            const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
            const detectRes = await this.detector.detect(imageBuffer);

            return res.json([{ res: detectRes, err: '' }]);
        } catch (error) {
            return res.status(500).json([{ res: {}, err: `Error detecting image: ${(error as Error).message}` }]);
        }
    }

    @Post('/batch/url/detect', upload.array('imageList'))
    async batchDetectWithURL(req: Request, res: Response<DetectResponse[]>) {
        const { urlList } = req.body;
        if (!urlList || !Array.isArray(urlList) || !urlList.length) {
            return res.status(400).json([{ res: {}, err: 'Missing image list url' }]);
        }

        const detectRes: DetectResponse[] = [];
        await Promise.all(
            urlList.map(async (url: string) => {
                try {
                    const imageResp = await fetch(url);
                    if (!imageResp.ok) {
                        detectRes.push({ res: {}, err: `Failed to fetch image from (${url}) status: ${imageResp.status}` });
                        return;
                    }
                    const buffer = Buffer.from(await imageResp.arrayBuffer());
                    const detectionResult = await this.detector.detect(buffer);
                    detectRes.push({ res: detectionResult, err: '' });
                } catch (error) {
                    detectRes.push({ res: {}, err: `Error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(detectRes);
    }
}
