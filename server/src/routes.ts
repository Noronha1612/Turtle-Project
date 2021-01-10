import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import { encryptItem } from './utils/encryptItem';

import UsersController from './controllers/UsersController';

const usersController = new UsersController();

const routes = Router();

routes.get('/users', celebrate({
    headers: Joi.object({
        ids: Joi.string().required()
    }).options({ allowUnknown: true })
}), usersController.index);

routes.post('/users', celebrate({
    body: Joi.object({
        name: Joi.string().required(),
        nickname: Joi.string().required(),
        whatsapp: Joi.string().required(),
        city: Joi.string().required(),
        email: Joi.string().required(),
        avatar_id: Joi.number().required(),
        password: Joi.string().required(),
        birthday: Joi.string().required()
    })
}), usersController.create);

routes.post('/users/sendCodeEmail', usersController.sendAuthCode);

routes.put('/users', celebrate({
    body: Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
        whatsapp: Joi.string().required(),
        city: Joi.string().required(),
        email: Joi.string().required(),
        avatar_id: Joi.number().required()
    })
}), usersController.updateGenericData);

routes.put('/users/password', celebrate({
    body: Joi.object({
        newPassword: Joi.string().required(),
        confirmNewPassword: Joi.string().required()
    }),
    headers: Joi.object({
        user_id: Joi.string().required()
    }).options({ allowUnknown: true })
}), usersController.updatePassword);

export default routes;