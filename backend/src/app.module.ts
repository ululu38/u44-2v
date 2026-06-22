import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import configuration from './domain/config/configuration.js';
import { DrizzleService } from './infrastructure/db/drizzle.service.js';
import { MailService } from './infrastructure/mail/mail.service.js';
import { JwtStrategy } from './infrastructure/auth/strategies/jwt.strategy.js';
import { AuthController } from './interface/controllers/auth.controller.js';
import { UserController } from './interface/controllers/user.controller.js';
import { ManagementController } from './interface/controllers/management.controller.js';
import { TicketController } from './interface/controllers/ticket.controller.js';
import { TicketManagementController } from './interface/controllers/ticket-management.controller.js';
import { PostController } from './interface/controllers/post.controller.js';
import { PartnerController } from './interface/controllers/partner.controller.js';
import { MediaController } from './interface/controllers/media.controller.js';
import { MediaService } from './infrastructure/media/media.service.js';
import { SlugService } from './infrastructure/media/slug.service.js';
import { HashtagsService } from './infrastructure/search/hashtags.service.js';
import { HashtagController } from './interface/controllers/hashtag.controller.js';
import { ClientGroupController } from './interface/controllers/client-group.controller.js';
import { ClientController } from './interface/controllers/client.controller.js';
import { SearchController } from './interface/controllers/search.controller.js';
import { UploadsController } from './interface/controllers/uploads.controller.js';





@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret')!,
        signOptions: { expiresIn: configService.get<any>('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    ManagementController,
    TicketController,
    TicketManagementController,
    PostController,
    PartnerController,
    MediaController,
    HashtagController,
    ClientGroupController,
    ClientController,
    SearchController,
    UploadsController,
  ],



  providers: [
    DrizzleService,
    MailService,
    JwtStrategy,
    MediaService,
    SlugService,
    HashtagsService,
  ],



})
export class AppModule {}
