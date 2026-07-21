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
} from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Controller('cameras')
@UseGuards(JwtAuthGuard)
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  async index(@Query() query: any) {
    return this.camerasService.findAll(query);
  }

  @Get('statistics')
  async statistics() {
    return this.camerasService.getStatistics();
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    return this.camerasService.findOne(parseInt(id));
  }

  @Post()
  async store(@Body() createDto: CreateCameraDto, @Req() req: any) {
    return this.camerasService.create(createDto, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCameraDto,
    @Req() req: any,
  ) {
    return this.camerasService.update(parseInt(id), updateDto, req.user);
  }

  @Delete(':id')
  async destroy(@Param('id') id: string, @Req() req: any) {
    return this.camerasService.remove(parseInt(id), req.user);
  }
}
