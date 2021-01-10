import { Request, Response } from 'express';
import db from '../database/database';

import { UserBodyGeneric, UserBodyRegister, UserResponse } from '../models/interfaces/IUser';
import User from '../models/userModel';
import sendEmail from '../services/sendEmail';
import generateToken from '../utils/generateToken';
import responseCodes from '../utils/responseCodes';

export default class UsersController {
    async index(request: Request, response: Response) {
        const { ids } = request.headers as { ids: string };

        const idList = ids.split(',');

        const dbResponse = await db('users')
            .select('*')
            .whereIn('id', idList) as UserResponse[];

        const filteredResponse = dbResponse.map( user => ({
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            whatsapp: user.whatsapp,
            city: user.city,
            email: user.email,
            avatar_id: user.avatar_id,
            birthday: user.birthday
        }));

        return response.status(200).json({ error: false, data: filteredResponse ? filteredResponse : [] });
    }

    async create(request: Request, response: Response) {
        const userToBeInserted = new User(null);

        const responseCode = await userToBeInserted.insertIntoDB(request.body);

        const token = generateToken({
            id: userToBeInserted.getUserId(),
            nickname: userToBeInserted.getUserBody()?.nickname,
            avatar_id: userToBeInserted.getUserBody()?.avatar_id
        })

        return response.status(responseCode).json({ error: false, token });
    }

    async updateGenericData(request: Request, response: Response) {
        const { id, ...givenData } = request.body;

        const responseCode = await new User(id).updateGenericData(givenData);

        return response.status(responseCode).json({ error: false, data: givenData });
    }

    async updatePassword(request: Request, response: Response) {
        const { newPassword, confirmNewPassword } = request.body;
        const { user_id } = request.headers;

        const responseCode = await new User('user_id').updatePassword(newPassword, confirmNewPassword);

        return response.status(responseCode).json({ error: false, data:[{ userId: user_id }] });
    }

    async sendAuthCode(request: Request, response: Response) {
        const { user_id } = request.headers as { user_id: string };

        const user = new User(user_id);
        await user.setUserBody();

        const responseCode = await user.sendCodeEmail();

        const token = generateToken({
            exp: Date.now() + (1000 * 60 * 60),
            email: user.getUserBody()?.email
        });

        if ( responseCode === responseCodes.OK ) return response.status(responseCode).json({ error: false, token });
        else return response.status(responseCode).json({ error: true });
    }
}