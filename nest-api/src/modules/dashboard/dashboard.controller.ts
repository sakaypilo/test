import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async index() {
    return this.dashboardService.getDashboardData();
  }

  @Get('alertes')
  async alertes(@Req() req: any) {
    return this.dashboardService.getAlertes(req.user);
  }
}
