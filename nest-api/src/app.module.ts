import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { PersonnesModule } from './modules/personnes/personnes.module';
import { RapportsModule } from './modules/rapports/rapports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TrashModule } from './modules/trash/trash.module';
import { SimpleActionsModule } from './modules/simple-actions/simple-actions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CamerasModule,
    IncidentsModule,
    PersonnesModule,
    RapportsModule,
    DashboardModule,
    TrashModule,
    SimpleActionsModule,
  ],
})
export class AppModule {}
