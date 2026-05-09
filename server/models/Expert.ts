import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailableSlot {
  date: string;
  slots: string[];
}

export interface IExpert extends Document {
  name: string;
  category: string;
  experience: number;
  rating: number;
  availableSlots: IAvailableSlot[];
}

const ExpertSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, required: true, default: 0 },
  availableSlots: [
    {
      date: { type: String, required: true },
      slots: [{ type: String }]
    }
  ]
}, { timestamps: true });

// Using models to prevent overwrite model error in development
export const Expert = (mongoose.models.Expert as mongoose.Model<IExpert>) || mongoose.model<IExpert>('Expert', ExpertSchema);
