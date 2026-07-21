import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { RapportsService } from './rapports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateIncidentReportDto } from './dto/generate-incident-report.dto';

@Controller('rapports')
@UseGuards(JwtAuthGuard)
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get()
  async index(@Query() query: any) {
    return this.rapportsService.findAll(query);
  }

  @Get('statistics')
  async statistics() {
    return this.rapportsService.getStatistics();
  }

  @Post('incidents/:id')
  async generateIncidentReport(
    @Param('id') incidentId: string,
    @Body() dto: GenerateIncidentReportDto,
    @Req() req: any,
  ) {
    return this.rapportsService.createIncidentReport(
      parseInt(incidentId),
      dto,
      req.user,
    );
  }
}
