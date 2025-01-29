import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export class SwaggerConfig {
  private static readonly CONFIG = {
    title: 'Monitor Web App API',
    description: 'API per la gestione delle App connesse al monitor',
    version: '1.0',
    tag: 'apps',
    path: 'doc',
    serverDescription: 'API Server with prefix',
  };

  private static getServerPrefix(): string {
    return process.env.NODE_ENV === 'production' ? '/monitor-web-app' : '';
  }

  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle(this.CONFIG.title)
      .setDescription(this.CONFIG.description)
      .setVersion(this.CONFIG.version)
      .addTag(this.CONFIG.tag)
      .addServer(this.getServerPrefix(), this.CONFIG.serverDescription)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const theme = new SwaggerTheme();
    
    const options = {
      explorer: true,
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA)
    };

    SwaggerModule.setup(this.CONFIG.path, app, document, options);

    console.log(
      `Swagger documentation available at: http://localhost:4002/${this.CONFIG.path}`,
    );
  }
}
