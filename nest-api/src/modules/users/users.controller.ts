import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async index(@Req() req: any, @Query() query: any) {
    const data = await this.usersService.findAll(req.user, query);
    return { success: true, data };
  }

  @Get('statistics')
  async statistics(@Req() req: any) {
    return this.usersService.getStatistics(req.user);
  }

  @Get(':id')
  async show(@Param('id') id: string, @Req() req: any) {
    const data = await this.usersService.findOne(parseInt(id), req.user);
    return { success: true, data };
  }

  @Post()
  async store(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const data = await this.usersService.create(createUserDto, req.user);
    return { success: true, message: 'Utilisateur créé avec succès', data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const data = await this.usersService.update(parseInt(id), updateUserDto, req.user);
    return { success: true, message: 'Utilisateur mis à jour avec succès', data };
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Req() req: any) {
    return this.usersService.resetPassword(parseInt(id), req.user);
  }

  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.usersService.changePassword(parseInt(id), changePasswordDto, req.user);
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string, @Req() req: any) {
    const data = await this.usersService.toggleStatus(parseInt(id), req.user);
    return { success: true, message: 'Statut utilisateur mis à jour avec succès', data };
  }
}
