import { Expose } from 'class-transformer'

export class UserDto {

    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    avatar: string;

    @Expose()
    twoFactorEnabled: boolean;

    @Expose()
    achievements: string;

    @Expose()
    friends: number[];

    @Expose()
    status: string;

    @Expose()
    custom_username: string;

    @Expose()
    num_wins: number;

    @Expose()
    blocked_users: number[];

    @Expose()
    is_first_login: boolean;
}
