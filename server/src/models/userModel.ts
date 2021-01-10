import { UserBodyGeneric, UserBodyRegister, UserResponse } from "./interfaces/IUser";
import db from '../database/database';

import checkValidDate from '../utils/checkValidDate';
import { encryptItem } from '../utils/encryptItem';
import generateToken from '../utils/generateToken';

import responseCodes from '../utils/responseCodes';
import checkIfUserExist from "../utils/checkIfUserExist";
import { response } from "express";

interface IGivenData extends UserBodyGeneric {
    id: number
}

export default class User {
    private userId: string | null;
    private userBody: UserBodyGeneric | undefined;

    constructor(userId: string | null) {
        this.userId = userId;

        if ( !this.userId ) this.userBody = undefined;
        else {
            Promise.resolve(this.searchUserBody()).then(
                result => this.userBody = result
            );
        }
    }

    async searchUserBody(): Promise<UserResponse | undefined> {
        function formatDate(date: string): string {
            // Receives "2002-12-16"
            return date.split('-').reverse().join("/");
        }

        const response = await this.searchByID(this.getUserId() as string, 
            "name",
            "nickname",
            "whatsapp",
            "city",
            "email",
            "avatar_id",
            "birthday"
        );

        const reworkedData = { ...response };

        if ( response ){    
            reworkedData.birthday = formatDate(reworkedData.birthday);
        } else return undefined;

        return reworkedData as UserResponse;
    }

    async searchByID(...fields: string[]): Promise<UserResponse | undefined> {
        if (!this.userId) return undefined;

        const response = await db('users')
            .select(fields)
            .where({ id: this.userId })
            .first<UserResponse | undefined>();

        return response;
    }

    async insertIntoDB(data: UserBodyRegister): Promise<responseCodes> {
        const trx = await db.transaction();
        try {
            if ( !checkValidDate(data.birthday) ) {
                await trx.rollback();
                return responseCodes.BAD_REQUEST;
            }
            if ( !data.email.includes('@') ) {
                await trx.rollback();
                return responseCodes.BAD_REQUEST;
            }
            if ( data.name.length < 3 && data.name.split(' ').length < 2 ) {
                await trx.rollback();
                return responseCodes.BAD_REQUEST;
            }
            if ( data.password.length < 6 ) {
                await trx.rollback();
                return responseCodes.FORBIDDEN;
            }
            if ( data.whatsapp.length !== 12 ) {
                await trx.rollback();
                return responseCodes.BAD_REQUEST;
            }
            if ( await checkIfUserExist(data.email, data.whatsapp) ) {
                await trx.rollback();
                return responseCodes.FORBIDDEN;
            }
    
            const encryptedPassword = encryptItem(data.password);
    
            if ( encryptedPassword.error ) {
                await trx.rollback();
                return responseCodes.INTERNAL_SERVER_ERROR;
            }
            
            data.password = encryptedPassword.item as string;
    
            const formattedDate = data.birthday.split('/').reverse().join('-'); // [ 12, 08, 2000 ]
    
            data.birthday = formattedDate;
    
            await trx('users').insert(data);
    
            const userId = await trx('users')
                .select('id')
                .where({ email: data.email })
                .first();
    
            this.userId = userId.id;
    
            await trx.commit();
    
            return responseCodes.CREATED;
        }
        catch(error) {
            await trx.rollback();
            return responseCodes.INTERNAL_SERVER_ERROR
        }
    }

    async updateGenericData(data: IGivenData) {
        try {
            await db('users')
                .update(data)
                .where({ id: this.getUserId() });

            return responseCodes.ACCEPTED;
        } catch (err) {
            return responseCodes.INTERNAL_SERVER_ERROR;
        }
    }

    public getUserId(): string | null {
        return this.userId;
    }

    public getUsetBody(): UserBodyGeneric | undefined {
        return this.userBody;
    }
    
}