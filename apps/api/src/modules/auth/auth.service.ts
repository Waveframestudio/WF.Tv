import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabaseClient: SupabaseClient | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private get supabase(): SupabaseClient {
    if (!this.supabaseClient) {
      const url = this.configService.get<string>('SUPABASE_URL') || 'https://placeholder.supabase.co';
      const key = this.configService.get<string>('SUPABASE_SERVICE_KEY') || 'placeholder-key';
      if (!url || url.includes('placeholder')) {
        this.logger.warn('SUPABASE_URL o SUPABASE_SERVICE_KEY no están configurados con valores reales');
      }
      this.supabaseClient = createClient(url, key);
    }
    return this.supabaseClient;
  }

  async login(loginDto: LoginDto) {
    // Autenticar contra Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener el usuario de nuestra DB
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Token de refresh inválido');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async logout(accessToken: string) {
    await this.supabase.auth.signOut();
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Valida el token de Supabase y retorna el usuario de nuestra DB.
   * Usado por el JwtStrategy.
   */
  async validateToken(supabaseUserId: string) {
    // Buscamos directamente en nuestra DB por ID, ya que el ID del usuario
    // en nuestra tabla "users" coincide con el UID de Supabase Auth.
    return this.prisma.user.findUnique({
      where: { id: supabaseUserId },
      include: { organization: true },
    });
  }
}
