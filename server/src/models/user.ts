export interface UserBodyGeneric {
    name: string;
    nickname: string;
    whatsapp: string;
    city: string;
    email: string;
    avatar_id: number;
}

export interface UserBodyRegister extends UserBodyGeneric {
    password: string;
    birthday: string;
}

export interface UserResponse extends UserBodyGeneric {
    id: number;
    birthday: string;
}
