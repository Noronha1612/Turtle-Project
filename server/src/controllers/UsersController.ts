import { Request, Response } from 'express';
import db from '../database/database';

import { UserBodyGeneric, UserBodyRegister, UserResponse } from '../models/user';

import checkIfUserExist from '../utils/checkIfUserExist';
import checkValidDate from '../utils/checkValidDate';
import { encryptItem } from '../utils/encryptItem';
import generateToken from '../utils/generateToken';

interface IGivenData extends UserBodyGeneric {
    id: number
}

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
        const trx = await db.transaction();

        const data: UserBodyRegister = request.body;

        if ( !checkValidDate(data.birthday) ) {
            await trx.rollback();
            return response.status(400).json({ error: true, message: 'Invalid birthday' });
        }
        if ( !data.email.includes('@') ) {
            await trx.rollback();
            return response.status(400).json({ error: true, message: 'Invalid email' });
        }
        if ( data.name.length < 3 && data.name.split(' ').length < 2 ) {
            await trx.rollback();
            return response.status(400).json({ error: true, message: 'Invalid full name' });
        }
        if ( data.password.length < 6 ) {
            await trx.rollback();
            return response.status(400).json({ error: true, message: 'Password too short' });
        }
        if ( data.whatsapp.length !== 12 ) {
            await trx.rollback();
            return response.status(400).json({ error: true, message: 'Invalid whatsapp' });
        }
        if ( await checkIfUserExist(data.email, data.whatsapp) ) {
            await trx.rollback();
            return response.status(401).json({ error: true, message: 'User already exist' });
        }

        const encryptedPassword = encryptItem(data.password);

        if ( encryptedPassword.error ) {
            await trx.rollback();
            return response.status(500).json({ error: true, message: 'Internal Server Error' });
        }
        
        data.password = encryptedPassword.item as string;

        const formattedDate = data.birthday.split('/').reverse().join('-'); // [ 12, 08, 2000 ]

        data.birthday = formattedDate;

        await trx('users').insert(data);

        const userId = await trx('users')
            .select('id')
            .where({ email: data.email })
            .first();

        const token = generateToken({
            id: userId.id,
            nickname: data.nickname,
            avatar_id: data.avatar_id
        });

        await trx.commit();

        return response.status(200).json({ error: false, token});
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