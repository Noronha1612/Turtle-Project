import db from '../database/database';

export default async function checkIfUserExist(email: string, whatsapp: string): Promise<boolean> {

    const response = await db('users')
        .select('name')
        .where({ email })
        .orWhere({ whatsapp })
        .first();

    if ( !response ) return false;

    return true;
}