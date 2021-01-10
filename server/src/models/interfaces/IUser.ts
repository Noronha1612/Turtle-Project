export interface UserBodyGeneric {
    name: string;
    nickname: string;
    whatsapp: string;
    city: string;
    email: string;
    avatar_id: number;
    birthday: string;
}

export interface UserBodyRegister extends UserBodyGeneric {
    password: string;
}

export interface UserResponse extends UserBodyGeneric {
    id: number;
}
