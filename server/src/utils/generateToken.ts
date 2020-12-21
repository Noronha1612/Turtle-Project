import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

export default function generateToken(payload: object) {
    const tokenKey = process.env.JWT_KEY;
    if ( !tokenKey ) return;

    const token = jwt.sign(payload, tokenKey);

    return token;
}