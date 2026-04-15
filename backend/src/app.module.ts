import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './modules/storage/storage.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configurations from './config';
import { DataSourceOptions } from 'typeorm';
import { AuditModule } from './modules/audit/audit.module';
import { RoleModule } from './modules/role/role.module';
import { ServicesModule } from './modules/services/services.module';
import dbConfig from './config/db.config';
import { CacheModule } from '@nestjs/cache-manager';
import { MailsModule } from './mails/mails.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configurations,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000, // 1 second cache
      max: 30, // max 30 items
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [dbConfig.KEY],
      useFactory: (config: ConfigType<typeof dbConfig>): DataSourceOptions =>
        ({
          // url: dbConfig.url,
          // ssl: { rejectUnauthorized: true },
          type: config.type,
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // timezone: 'Z', // Manual handling via transformers
          // flag to force driver to return strings
          extra: {
            dateStrings: true,
          },
          cache: true,
          synchronize: false, // Set to false in production
          logging: true,
        }) as DataSourceOptions,
    }),
    MailsModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    ReportsModule,
    TasksModule,
    CustomersModule,
    MetricsModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    RoleModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
