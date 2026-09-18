import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const secret = process.env.SUPABASE_JWT_SECRET || 'placeholder-jwt-secret-at-least-32-chars-long';
    console.log('[JwtStrategy] Initialized. Secret length:', secret.length);
    
    // Supabase firma los JWTs usando los bytes decodificados del secret en Base64.
    // Si el secret no es base64 válido o es de prueba, usamos Buffer.from(secret).
    let secretBuffer: Buffer;
    try {
      secretBuffer = Buffer.from(secret, 'base64');
    } catch {
      secretBuffer = Buffer.from(secret);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretBuffer,
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
