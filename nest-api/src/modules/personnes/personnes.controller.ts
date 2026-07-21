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
import { FileInterceptor } from '@nestjs/platform-express';
import { PersonnesService } from './personnes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePersonneDto } from './dto/create-personne.dto';
import { UpdatePersonneDto } from './dto/update-personne.dto';
import { AddInterpellationDto } from './dto/add-interpellation.dto';
import { personnesMulterConfig } from './config/multer.config';

@Controller('personnes')
@UseGuards(JwtAuthGuard)
export class PersonnesController {
  constructor(private readonly personnesService: PersonnesService) {}

  @Get()
  async index(@Query() query: any) {
    return this.personnesService.findAll(query);
  }

  @Get('statistics')
  async statistics() {
    return this.personnesService.getStatistics();
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    return this.personnesService.findOne(parseInt(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', personnesMulterConfig))
  async store(
    @Body() createDto: CreatePersonneDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.personnesService.create(createDto, req.user.idUtilisateur, files);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', personnesMulterConfig))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonneDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.personnesService.update(parseInt(id), updateDto, req.user, files);
  }

  @Delete(':id')
  async destroy(@Param('id') id: string, @Req() req: any) {
    return this.personnesService.softDelete(parseInt(id), req.user);
  }

  @Post(':id/interpellations')
  async addInterpellation(
    @Param('id') id: string,
    @Body() interpellationDto: AddInterpellationDto,
    @Req() req: any,
  ) {
    return this.personnesService.addInterpellation(
      parseInt(id),
      interpellationDto,
      req.user.idUtilisateur,
    );
  }
}
