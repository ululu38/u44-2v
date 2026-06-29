import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './domain/config/configuration.js';
import { DrizzleService } from './infrastructure/db/connector.js';
// import { MailService } from './infrastructure/mail/mail.service';
import { JwtStrategy } from './infrastructure/auth/strategies/jwt.strategy.js';
import { AuthController } from './interface/controllers/auth.controller.js';
import { UserController } from './interface/controllers/user.controller.js';

import { TicketController } from './interface/controllers/ticket.controller.js';
import { PostController } from './interface/controllers/post.controller.js';
import { PartnerController } from './interface/controllers/partner.controller.js';
import { MediaController } from './interface/controllers/media.controller.js';
import { MediaService } from './service/media.service.js';
import { SlugService } from './service/slug.service.js';
import { HashtagsService } from './service/hashtags.service.js';
import { HashtagController } from './interface/controllers/hashtag.controller.js';
import { ClientGroupController } from './interface/controllers/client-group.controller.js';
import { ClientController } from './interface/controllers/client.controller.js';




import { BannerController } from './interface/controllers/banner.controller.js';
import { BannerService } from './service/banner.service.js';
import { ClientGroupService } from './service/client-group.service.js';
import { ClientService } from './service/client.service.js';
import { PartnerService } from './service/partner.service.js';
import { UserService } from './service/user.service.js';
import { TicketService } from './service/ticket.service.js';
import { PostService } from './service/post.service.js';
import { PostRepository } from './infrastructure/repositories/post.repository.js';
import { AuthService } from './service/auth.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        ttl: configService.get<number>('throttler.ttl')!,
        limit: configService.get<number>('throttler.limit')!,
      }],
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
    TicketController,
    PostController,
    PartnerController,
    MediaController,
    HashtagController,
    ClientGroupController,
    ClientController,
    BannerController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    DrizzleService,
    JwtStrategy,
    MediaService,
    SlugService,
    HashtagsService,
    BannerService,
    ClientGroupService,
    ClientService,
    PartnerService,
    UserService,
    TicketService,
    PostService,
    PostRepository,
    AuthService,
  ],
})
export class AppModule {}
