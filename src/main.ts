import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  ConfigModule.forRoot({
    envFilePath: `${process.env.NODE_ENV ? process.env.NODE_ENV : ''}.env`,
  });

  console.log(process.env.NODE_ENV);

  const PORT = process.env.PORT || 4000;
  const HOST = process.env.HOST || 'localhost';

  const app = await NestFactory.create(AppModule);
  let protocol = 'http';

  if (process.env.NODE_ENV === 'prod') {
    const httpsOptions = {
      key: fs.readFileSync(
        process.env.PATH_PRIVATE_KEY || 'path_to_your_private_key.pem',
      ),
      cert: fs.readFileSync(
        process.env.PATH_CERTIFICATE || 'path_to_your_certificate.pem',
      ),
    };

    const server = https.createServer(
      httpsOptions,
      app.getHttpAdapter().getInstance(),
    );

    await app.init();
    server.listen(PORT);

    protocol = 'https';
  } else {
    await app.listen(PORT);
  }

  console.log(`
  🚀  Local Storage API server, launched at ${protocol}://${HOST}:${PORT}`);
}

bootstrap();
