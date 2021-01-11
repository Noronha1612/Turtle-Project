import { Request, Response } from 'express';
import { encryptItem } from '../utils/encryptItem';
import responseCodes from '../utils/responseCodes';

export default class ServicesController {
    async encrypt(request: Request, response: Response) {
        try {
            const { item } = request.body as { item: string };

            return response.status(responseCodes.OK).json({ error: false, data:[{ encryptedItem: encryptItem(item) }] });
        } catch (err) {
            console.log(err);
            return response.status(responseCodes.INTERNAL_SERVER_ERROR).json({ error: true });
        }
    }
}