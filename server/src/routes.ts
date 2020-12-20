import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

const routes = Router();

routes.get('/', (request, response) => {
    return response.status(200).json({ message: 'All right' });
});

export default routes;