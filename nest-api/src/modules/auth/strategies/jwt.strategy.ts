import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: number; email: string; role?: string }) {
    // Si le token contient déjà le rôle (tokens récents), pas besoin d'aller en DB
    if (payload.role) {
      return {
        idUtilisateur: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }

    // Fallback pour les anciens tokens sans rôle : une seule requête DB
    const user = await this.prisma.user.findUnique({
      where: { idUtilisateur: payload.sub },
      select: {
        idUtilisateur: true,
        email: true,
        role: true,
        matricule: true,
        nom: true,
        prenom: true,
        actif: true,
      },
    });

    if (!user || !user.actif) {
      throw new UnauthorizedException({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé.',
      });
    }

    return user;
  }
}
