import { UserBodyGeneric, UserBodyRegister, UserResponse } from "./interfaces/IUser";
import db from '../database/database';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

import checkValidDate from '../utils/checkValidDate';
import { encryptItem } from '../utils/encryptItem';
import responseCodes from '../utils/responseCodes';
import checkIfUserExist from "../utils/checkIfUserExist";

import sendEmail from '../services/sendEmail';
import generateAuthCode from "../utils/generateAuthCode";
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
        else this.setUserBody();
    }

    async setUserBody() {
        if ( this.userBody ) return;

        const response = await this.searchByID( 
            "name",
            "nickname",
            "whatsapp",
            "city",
            "email",
            "avatar_id",
            "birthday"
        );

        this.userBody = response;
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

    async updatePassword(newPassword: string, confirmNewPassword: string): Promise<responseCodes> {
        try {
            if ( newPassword !== confirmNewPassword ) 
                return responseCodes.FORBIDDEN;
            
            if ( newPassword.length < 3 || !newPassword )
                return responseCodes.FORBIDDEN;
                
            const { item: encryptedNewPassword } = encryptItem(newPassword); 

            const {password: previousPassword} = await db('users')
                .select('password')
                .where({ id: this.getUserId() })
                .first();
            
            if ( encryptedNewPassword === previousPassword )
                return responseCodes.FORBIDDEN;

            await db('users')
                .update({ password: encryptedNewPassword })
                .where({ id: this.getUserId() });

            return responseCodes.ACCEPTED;
        } catch(err) {
            return responseCodes.INTERNAL_SERVER_ERROR;
        }
    }

    async sendCodeEmail() {
        if ( this.userBody ) {
            try {
                const code = generateAuthCode();

                process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

                const htmlPath = path.resolve(__dirname, "..", "services", "sendEmail", "template.html");
                const source = fs.readFileSync(htmlPath, 'utf-8').toString();
                const template = handlebars.compile(source);
                const replacements = { authCode: code }
                const htmlToSend = template(replacements);

                sendEmail(
                    ['Auth Code', htmlToSend],
                    this.userBody.email,
                    "noreply@feetsupport.com"
                );

                return [responseCodes.OK, code];
            } catch (err) {
                console.log(err);
                return [responseCodes.INTERNAL_SERVER_ERROR];
            }
        } else return [responseCodes.INTERNAL_SERVER_ERROR];
    }

    public getUserId(): string | null {
        return this.userId;
    }

    public getUserBody(): UserBodyGeneric | undefined {
        return this.userBody;
    }
    
}