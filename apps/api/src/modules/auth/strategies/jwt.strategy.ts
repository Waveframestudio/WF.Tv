import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const secret = process.env.SUPABASE_JWT_SECRET;
    console.log('[JwtStrategy] Initialized. Secret length:', secret ? secret.length : 0);
    
    // Supabase firma los JWTs usando los bytes decodificados del secret en Base64.
    // Si pasamos el string base64 directo, la firma no coincide y da 401.
    const secretBuffer = secret ? Buffer.from(secret, 'base64') : null;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretBuffer!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validate called with payload:', payload);
    const user = await this.authService.validateToken(payload.sub);
    console.log('[JwtStrategy] User found in database:', user ? `Yes (${user.email})` : 'No');
    if (!user) {
      throw new UnauthorizedException('User not found in local database');
    }
    return user;
  }
}
