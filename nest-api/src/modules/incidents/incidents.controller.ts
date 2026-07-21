import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { ValidateIncidentDto } from './dto/validate-incident.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { SoftDeleteDto } from './dto/soft-delete.dto';
import { multerConfig } from './config/multer.config';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async index(@Query() query: any) {
    return this.incidentsService.findAll(query);
  }

  @Get('statistics')
  async statistics() {
    return this.incidentsService.getStatistics();
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    return this.incidentsService.findOne(parseInt(id));
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo0', maxCount: 1 },
        { name: 'photo1', maxCount: 1 },
        { name: 'photo2', maxCount: 1 },
        { name: 'photo3', maxCount: 1 },
        { name: 'photo4', maxCount: 1 },
        { name: 'photo5', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  async store(
    @Body() createDto: CreateIncidentDto,
    @Req() req: any,
    @UploadedFiles()
    files?: {
      photo0?: Express.Multer.File[]
      photo1?: Express.Multer.File[]
      photo2?: Express.Multer.File[]
      photo3?: Express.Multer.File[]
      photo4?: Express.Multer.File[]
      photo5?: Express.Multer.File[]
    },
  ) {
    return this.incidentsService.create(createDto, req.user.idUtilisateur, files);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncidentDto,
    @Req() req: any,
  ) {
    return this.incidentsService.update(parseInt(id), updateDto, req.user);
  }

  @Delete(':id')
  async destroy(
    @Param('id') id: string,
    @Body() deleteDto: SoftDeleteDto,
    @Req() req: any,
  ) {
    return this.incidentsService.softDelete(parseInt(id), deleteDto, req.user);
  }

  @Post(':id/validate')
  async validate(
    @Param('id') id: string,
    @Body() validateDto: ValidateIncidentDto,
    @Req() req: any,
  ) {
    return this.incidentsService.validate(parseInt(id), validateDto, req.user);
  }

  @Post('bulk-update')
  async bulkUpdate(@Body() bulkDto: BulkUpdateDto, @Req() req: any) {
    return this.incidentsService.bulkUpdate(bulkDto, req.user);
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() bulkDto: BulkDeleteDto, @Req() req: any) {
    return this.incidentsService.bulkDelete(bulkDto, req.user);
  }
}
