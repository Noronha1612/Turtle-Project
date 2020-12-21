import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import { encryptItem } from './utils/encryptItem';

const routes = Router();

routes.get('/', (request, response) => {
    return response.status(200).json({ message: 'All right' });
});

export default routes;