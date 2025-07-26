import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBannedIP extends Document {
  ip: string;
  bannedUntil: number;
  attempts: number;
}

const BannedIPSchema: Schema = new Schema<IBannedIP>({
  ip: { type: String, required: true, unique: true },
  bannedUntil: { type: Number, required: true },
  attempts: { type: Number, required: true },
});

const BannedIP: Model<IBannedIP> = mongoose.models.BannedIP || mongoose.model<IBannedIP>('BannedIP', BannedIPSchema);

export default BannedIP;
