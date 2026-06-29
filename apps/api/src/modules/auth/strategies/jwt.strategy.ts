import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // El token viene del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // El secret es el mismo que usa Supabase para firmar los JWT
      secretOrKey: process.env.SUPABASE_JWT_SECRET!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateToken(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
