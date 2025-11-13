import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' },
  });
  const port = process.env.PORT || 3000;

  const gRPCPort = process.env.GRPC_PORT || 9001;
  const grpcUrl = `0.0.0.0:${gRPCPort}`;

  const grpcServer = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: 'auth',
      protoPath: join(__dirname, '../proto/server/auth.proto'),
    },
  });

  await grpcServer.listen().then(() => {
    console.log(`gRPC server is listening at ${grpcUrl}`);
  });

  await app.listen(port).then(() => {
    console.log(`Auth service is running on http://localhost:${port}`);
  });
}
bootstrap();
