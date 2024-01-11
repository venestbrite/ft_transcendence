import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([ (req) => {
				var token = null;
				if (req && req.cookies) {
					token = req.cookies['token'];
				}
				return token;
			} ]),
			ignoreExpiration: false,
			secretOrKey: 'secret',
 		});
	}

	async validate(payload: { username: string, id: number }) {
		return {
			username: payload.username,
			user_id: payload.id,
		};
	}
}
