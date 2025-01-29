import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from '@nestjs/axios';
import { App, AppSchema } from "./swagger/app.schema";
import { AppsController } from "./apps.controller";
import { AppsService } from "./apps.service";

@Module({
	imports: [
		MongooseModule.forFeature(
			[{ name: App.name, schema: AppSchema }],
			"apps"
		),
		HttpModule,
	],
	controllers: [AppsController],
	providers: [AppsService],
})
export class AppsModule {}
