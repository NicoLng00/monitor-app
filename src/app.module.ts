import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { AppsModule } from './modules/Apps/apps.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { TenantMiddleware } from './middlewares/tenant.middleware';

@Module({
	imports: [
		MongooseModule.forRoot("mongodb://192.168.56.56:27017/monitor_test", {
			connectionName: "apps",
			user: "",
			pass: "",
			authSource: "",
			autoIndex: true,
		}),
		AppsModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggingMiddleware, TenantMiddleware).forRoutes("*");
	}
}
