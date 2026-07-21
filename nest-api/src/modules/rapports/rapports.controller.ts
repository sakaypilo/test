import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  Res,
  Header,
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

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: any) {
    return this.rapportsService.downloadPdf(parseInt(id), res);
  }

  @Get('incidents/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="incidents.csv"')
  async exportIncidents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('zone') zone?: string,
  ) {
    return this.rapportsService.exportIncidentsCsv({ from, to, zone });
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
