import faker from 'faker';
import User from '../../src/models/userModel';

export default async function createUser(overwrittenValues: object) {

    const formatDate = (date: Date) => {
        const days = date.getDate();
        const months = date.getMonth();
        const year = date.getFullYear();

        return `${days}/${months}/${year}`
    }

    const initialData = {
        name: faker.name.findName(),
        nickname: faker.name.firstName(),
        whatsapp: faker.phone.phoneNumber(),
        city: faker.address.city(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        birthday: formatDate(faker.date.past()),
        avatar_id: faker.random.number(12)
    }

    const userData = {
        ...initialData,
        ...overwrittenValues
    }

    new User(faker.random.number().toString()).insertIntoDB(userData);
}