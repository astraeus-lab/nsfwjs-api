import sharp from 'sharp';

export class FormatImageService {
    async imgFromatType(imgBuffer: Buffer, target: keyof sharp.FormatEnum) {
        try {
            const convertedImage = await sharp(imgBuffer)
                .toFormat(target)
                .toBuffer();

            return convertedImage;
        } catch (error) {
            throw new Error(`image format conversion failed: ${(error as Error).message}`);
        }
    }

    async getImgFormat(imgBuffer: Buffer) {
        try {

            return (await sharp(imgBuffer).metadata()).format || "";
        } catch(error) {
            throw new Error(`get image format error: ${(error as Error).message}`)
        }
    }
}
