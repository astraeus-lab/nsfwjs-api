import { Request, Response } from 'express';
import { Controller, Post } from 'simple-ts-express-decorators';
import { DetectImageService } from 'app/service/detectImageService';
import { FormatImageService } from 'app/service/formatImageService';

interface DetectRequest {
    udid?: string;
    data: string;
}

interface DetectResponse {
    udid: string;

    res: any;
    err: string;
}

@Controller()
export class ImageDetectController {
    detector: DetectImageService;
    formater: FormatImageService;
    allowedImageType: Map<string, boolean>;

    constructor() {
        this.detector = new DetectImageService();
        this.formater = new FormatImageService();
        this.allowedImageType = new Map([
            ["gif", true],
            ["png", true],
            ["jpeg", true]
        ]);
    }

    @Post('/classify/data')
    async batchDetectWithContent(req: Request, res: Response<DetectResponse[]>) {
        const source = req.body.source;
        if (!source || !Array.isArray(source) || source.length === 0) {
            return res.status(400).json([{ udid: '', res: {}, err: 'missing image data in request body' }]);
        }

        const allDetectRes: DetectResponse[] = [];
        await Promise.all(
            source.map(async (single: DetectRequest) => {
                const imageUDID = single.udid || single.data;
                try {
                    const data = await this.#formatImgType(Buffer.from(single.data, 'base64'))
                    const detectRes = await this.detector.detect(data);
                    allDetectRes.push({ udid: imageUDID, res: detectRes, err: '' });
                } catch (error) {
                    allDetectRes.push({ udid: imageUDID, res: {}, err: `error detecting image: ${(error as Error).message}` });
                }
            })
        );
    
        return res.json(allDetectRes);
    }

    @Post('/classify/url')
    async batchDetectWithURL(req: Request, res: Response<DetectResponse[]>) {
        const source = req.body.source;
        if (!source || !Array.isArray(source) || !source.length) {
            return res.status(400).json([{ udid: '', res: {}, err: 'missing image url in request body' }]);
        }

        const detectRes: DetectResponse[] = [];
        await Promise.all(
            source.map(async (single: DetectRequest) => {
                const imageUDID = single.udid || single.data;
                try {
                    const imgContent = await fetch(single.data);
                    if (!imgContent.ok) {
                        detectRes.push({ 
                            udid: imageUDID,
                            res: {}, 
                            err: `failed to fetch image from url status: ${imgContent.status}` 
                        });

                        return;
                    }

                    const data = await this.#formatImgType(Buffer.from(await imgContent.arrayBuffer()));
                    const singleDetectRes = await this.detector.detect(data);
                    detectRes.push({ udid: imageUDID, res: singleDetectRes, err: '' });
                } catch (error) {
                    detectRes.push({ udid: imageUDID, res: {}, err: `error detecting image: ${(error as Error).message}` });
                }
            })
        );

        return res.json(detectRes);
    }

    async #formatImgType(imgBuffer: Buffer) {
        const imgType = (await this.formater.getImgFormat(imgBuffer))?.toString();
        if (this.allowedImageType.get(imgType)) {
            return imgBuffer;
        }

        try {
            return this.formater.imgFromatType(imgBuffer, "jpeg");
        } catch(error) {
            throw error
        }
    }
}
