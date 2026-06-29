import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VideosModule } from './modules/videos/videos.module';
import { OverlaysModule } from './modules/overlays/overlays.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { ScreensModule } from './modules/screens/screens.module';
import { SyncModule } from './modules/sync/sync.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { LocationsModule } from './modules/locations/locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    VideosModule,
    OverlaysModule,
    PlaylistsModule,
    ScreensModule,
    SyncModule,
    OrganizationsModule,
    LocationsModule,
  ],
})
export class AppModule {}
