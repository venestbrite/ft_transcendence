import { PassportStrategy } from '@nestjs/passport';
import {
    Injectable, UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
        private readonly http: HttpService
    ) {
        super({
            authorizationURL: `https://api.intra.42.fr/oauth/authorize?${stringify({
                client_id: configService.get<string>("CLIENT_ID"),
                redirect_uri: configService.get<string>("CALLBACK_URL"),
                response_type: 'code',
                scope: ['public']
            })}`,
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            scope: 'public',
            clientID: configService.get<string>("CLIENT_ID"),
            clientSecret: configService.get<string>("CLIENT_SECRET"),
            callbackURL: configService.get<string>("CALLBACK_URL"),
        });
    }

    async validate(accessToken: string): Promise<any> {
        const { data } = await this.http.get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).toPromise();
        const user = await this.userService.findOne(data.login);
        if (!user) {
            const newUser = this.userService.generate({
                username: data.login,
                oauthToken: accessToken,
                avatar: data.image_url,
                twoFactorEnabled: false,
            })
            return this.userService.create(newUser);
        }
        return user;
    }
}
