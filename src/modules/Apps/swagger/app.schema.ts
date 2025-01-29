import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class App {
  @Prop({ required: true })
  tenant: string;

  @Prop({ required: true })
  app_name: string;

  @Prop({ type: Object, required: true })
  mongodb: {
    uri: string;
    user: string;
    password: string;
    db_name: string;
  };
}

export type AppDocument = App & Document;
export const AppSchema = SchemaFactory.createForClass(App);