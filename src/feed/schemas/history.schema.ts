import { Prop, Schema, SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type HistoryDocument = History & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class History {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @Prop()
  content: string;

  /* timestamps */
  createAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
