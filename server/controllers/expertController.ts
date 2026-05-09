import { Request, Response } from 'express';
import { Expert } from '../models/Expert';

export const getExperts = async (req: Request, res: Response) => {
  try {
    const { name, category, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query: any = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1 });

    res.json({
      experts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error in getExperts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExpertById = async (req: Request, res: Response) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    
    res.json(expert);
  } catch (error) {
    if ((error as any).name === 'CastError') {
      return res.status(404).json({ error: 'Invalid expert ID FORMAT' });
    }
    console.error('Error in getExpertById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
