import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Expert } from '../models/Expert';
import { getIo } from '../sockets';
import mongoose from 'mongoose';

export const createBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { expertId, name, email, phone, date, timeSlot, notes } = req.body;

    // Basic Validation
    if (!expertId || !name || !email || !phone || !date || !timeSlot) {
      return res.status(400).json({ error: 'All fields except notes are required' });
    }

    // Check if the expert exists and has the available slot
    const expert = await Expert.findById(expertId).session(session);
    if (!expert) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Expert not found' });
    }

    // Check availability
    let slotAvailable = false;
    for (const d of expert.availableSlots) {
      if (d.date === date && d.slots.includes(timeSlot)) {
        slotAvailable = true;
        // Remove the slot from the expert's available schedule
        d.slots = d.slots.filter(s => s !== timeSlot);
        break;
      }
    }

    if (!slotAvailable) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Save expert changes
    await expert.save({ session });

    // Create Booking
    const newBooking = new Booking({
      expertId, name, email, phone, date, timeSlot, notes, status: 'Pending'
    });

    await newBooking.save({ session });
    await session.commitTransaction();

    // Broadcast the booked slot via Socket.io
    const io = getIo();
    io.emit('slot_booked', { expertId, date, timeSlot });

    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error creating booking:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This slot has already been booked (Double booking detected)' });
    }
    res.status(500).json({ error: 'Server error creating booking' });
  } finally {
    session.endSession();
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Status updated', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Server error updating booking status' });
  }
};

export const getBookingsByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const bookings = await Booking.find({ email: email as string })
      .populate('expertId', 'name category') // Populate expert name and category
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings by email:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
