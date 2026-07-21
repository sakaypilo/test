import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trash')
@UseGuards(JwtAuthGuard)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  async index() {
    return this.trashService.getTrash();
  }

  @Post(':type/:id/restore')
  async restore(
    @Param('type') type: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.trashService.restore(type, parseInt(id), req.user.idUtilisateur);
  }

  @Delete(':type/:id/permanent')
  async permanentDelete(
    @Param('type') type: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.trashService.permanentDelete(type, parseInt(id), req.user);
  }

  @Post('empty')
  async emptyTrash(@Req() req: any) {
    return this.trashService.emptyTrash(req.user);
  }
}
