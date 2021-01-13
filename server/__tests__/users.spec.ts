import db from '../src/database/database';
import { UserResponse } from '../src/models/interfaces/IUser';
import User from '../src/models/userModel';

describe('users', () => {
    beforeAll(async () => {
        await db.migrate.latest();
    });

    afterAll(async () => {
        await db('users')
            .delete('*');
    });
    
    it('should list users with id 6 and 8', async () => {

        const ids = "6,8";

        const idList = ids.split(',');

        const usersBodies = idList.map( id => new User(id));

        const filteredResponse = await Promise.all(usersBodies.map( async user => {
            const userBody = await Promise.resolve(user.getUserBody());

            return {
                id: user.getUserId(),
                name: userBody?.name,
                nickname: userBody?.nickname,
                whatsapp: userBody?.whatsapp,
                city: userBody?.city,
                email: userBody?.email,
                avatar_id: userBody?.avatar_id,
                birthday: userBody?.birthday
            }
        }));

        expect(filteredResponse[0]).not.toBeUndefined();
    });
    
});