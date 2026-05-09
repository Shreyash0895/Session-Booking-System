import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  expertId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
}

const BookingSchema: Schema = new Schema({
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
}, { timestamps: true });

// Prevent double booking at db level via unique index
BookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true });

export const Booking = (mongoose.models.Booking as mongoose.Model<IBooking>) || mongoose.model<IBooking>('Booking', BookingSchema);
