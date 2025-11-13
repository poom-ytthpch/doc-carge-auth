import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './common/prisma/prisma.module';
import { OtpModule } from './otp/otp.module';
import { BullModule } from '@nestjs/bull';
import { APP_FILTER } from '@nestjs/core';
import { GqlExceptionFilter } from './common/graphql/graphql-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/types/gql.ts'),
        outputAs: 'class',
      },
      formatError: (error) => ({
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_ERROR',
        path: error.path,
        details: error.extensions?.detail,
      }),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    PrismaModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GqlExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
