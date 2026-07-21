import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    // Find user by matricule
    const user = await this.prisma.user.findUnique({
      where: {
        matricule: loginDto.matricule,
        actif: true,
      },
    });

    if (!user) {
      // Log failed login attempt (without user)
      await this.prisma.connexion.create({
        data: {
          dateHeure: new Date(),
          adresseIP: ip,
          userAgent,
          succes: false,
        },
      });
      throw new UnauthorizedException({
        success: false,
        message: 'Matricule ou mot de passe incorrect.',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(loginDto.motDePasse, user.motDePasse);

    // Log login attempt
    await this.prisma.connexion.create({
      data: {
        dateHeure: new Date(),
        adresseIP: ip,
        userAgent,
        succes: isValidPassword,
        idUtilisateur: user.idUtilisateur,
      },
    });

    if (!isValidPassword) {
      throw new UnauthorizedException({
        success: false,
        message: 'Matricule ou mot de passe incorrect.',
      });
    }

    // Generate JWT token (matching Laravel token response)
    const token = this.jwtService.sign({ sub: user.idUtilisateur, email: user.email, role: user.role });

    // Return exactly same format as Laravel (snake_case)
    return {
      success: true,
      user: {
        id_utilisateur: user.idUtilisateur,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email,
        telephone: user.telephone,
      },
      token,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { idUtilisateur: userId, actif: true },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }

    return {
      success: true,
      user: {
        id_utilisateur: user.idUtilisateur,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email,
        telephone: user.telephone,
      },
    };
  }
}
