import { Module } from '@nestjs/common';
import { SimpleActionsController } from './simple-actions.controller';

@Module({
  controllers: [SimpleActionsController],
})
export class SimpleActionsModule {}
