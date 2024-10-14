import multer from 'multer';

import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import { Controller, Post } from "simple-ts-express-decorators";
import { NSFWDetectService } from "service/nsfwjsDetectService";

const upload = multer({storage: memoryStorage()});

@Controller()
export class ImageDetectController {
    detecter: NSFWDetectService;

    constructor() {
        this.detecter = new NSFWDetectService();
    }

    @Post('/single/content/detect', upload.single('image'))
    async singleDetectWithContent(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).send('Missing image multipart/form-data');
        }

        return res.json(await this.detecter.detect(req.file.buffer));
    }

    @Post('/batch/content/detect', upload.array('images'))
    async batchDetectWithContent(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).send('missing image list multipart/form-data');
        }

        const imageBufferList = (req.files as Express.Multer.File[]).map(file => file.buffer);
        const detectRes = await this.detecter.batchDetect(imageBufferList);

        return res.json(detectRes);
    }

    @Post('/single/url/detect', upload.single('image'))
    async singleDetectWithURL(req: Request, res: Response) {
        const { url } = req.body;
        if (!url) {
            return res.status(400).send('Missing image url');
        }

        try {
            const imageResp = await fetch(url);
            if (!imageResp.ok) {
                throw new Error(`Failed to fetch image from (${url}) status: ${imageResp.status}`);
            }

            const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
            const detectRes = await this.detecter.detect(imageBuffer);

            return res.json(detectRes);
        } catch (error) {
            return res.status(500).send(`Error fetching image from url: ${(error as Error).message}`);
        }
    }

    @Post('/batch/url/detect', upload.array('images'))
    async batchDetectWithURL(req: Request, res: Response) {
        const { urlList } = req.body;
        if (!urlList || !Array.isArray(urlList) || !urlList.length) {
            return res.status(400).send('Missing image list url');
        }

        try {
            const imageBufferList = await Promise.all(
                urlList.map(async (url: string) => {
                    const imageResp = await fetch(url);
                    if (!imageResp.ok) {
                        throw new Error(`Failed to fetch image from (${url}) status: ${imageResp.status}`);
                    }

                    return Buffer.from(await imageResp.arrayBuffer());
                })
            );
            const detectRes = await this.detecter.batchDetect(imageBufferList);

            return res.json(detectRes);
        } catch (error) {
            return res.status(500).send(`Error fetching images from url list: ${(error as Error).message}`);
        }
    }
}
