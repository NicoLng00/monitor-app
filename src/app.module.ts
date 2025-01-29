import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

@Module({
	imports: [
		MongooseModule.forRoot("mongodb://admin:AezPassword131%C2%A3A!@192.168.10.130:27017/gift_cards_test", {
			connectionName: "gift_cards",
			user: "admin",
			pass: "AezPassword131£A!",
			authSource: "admin",
			autoIndex: true,
		})
	],
})
export class AppModule {}
