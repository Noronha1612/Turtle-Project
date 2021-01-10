import { Request, Response } from 'express';
import db from '../database/database';

import { UserBodyGeneric, UserBodyRegister, UserResponse } from '../models/interfaces/IUser';
import User from '../models/userModel';
import generateToken from '../utils/generateToken';

export default class UsersController {
    async index(request: Request, response: Response) {
        const { ids } = request.headers as { ids: string };

        const idList = ids.split(',');

        const dbResponse = await db('users')
            .select('*')
            .whereIn('id', idList) as UserResponse[];

        const filteredResponse = dbResponse.map( user => ({
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

        userToBeInserted.insertIntoDB(request.body);

        const token = generateToken({
            id: userToBeInserted.getUserId(),
            nickname: userToBeInserted.getUsetBody()?.nickname,
            avatar_id: userToBeInserted.getUsetBody()?.avatar_id
        })

        return response.status(200).json({ error: false, token });
    }

    async updateGenericData(request: Request, response: Response) {
        const { id, ...givenData } = request.body as IGivenData;

        await db('users')
            .update(givenData)
            .where({ id });

        return response.status(200).json({ error: false, data: givenData });
    }

    async updatePassword(request: Request, response: Response) {
        const { newPassword, confirmNewPassword } = request.body;
        const { user_id } = request.headers;

        if ( newPassword !== confirmNewPassword ) 
            return response.status(403).json({ error: true, message: 'Passwords do not match' });
        
        if ( newPassword.length < 3 || !newPassword )
            return response.status(403).json({ error: true, message: 'Invalid password' });
            
        const { item: encryptedNewPassword } = encryptItem(newPassword); 

        const {password: previousPassword} = await db('users')
            .select('password')
            .where({ id: user_id })
            .first();
        
        if ( encryptedNewPassword === previousPassword )
            return response.status(403).json({ error: true, message: 'The password must not be equal to the previous one' })

        await db('users')
            .update({ password: encryptedNewPassword })
            .where({ id: user_id });

        return response.status(200).json({ error: false, data:[{ userId: user_id }] });
    }
}