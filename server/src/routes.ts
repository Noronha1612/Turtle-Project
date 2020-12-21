import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import { encryptItem } from './utils/encryptItem';

import UsersController from './controllers/UsersController';

const usersController = new UsersController();

const routes = Router();

routes.get('/users', usersController.index);
routes.post('/users', usersController.create);

export default routes;