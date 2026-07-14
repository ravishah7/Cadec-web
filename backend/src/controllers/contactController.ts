// backend/src/controllers/contactController.ts
import { Request, Response } from 'express';
import Contact from '../models/Contact';
import {
  sendContactEmail,
} from "../services/emailService";

// Submit contact form (public)
export const submitContact = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // Create contact record
    const contact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message
    });

    await contact.save();

    // Send email asynchronously (non-blocking)
    sendContactEmail({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    }).catch((error: any) => {
      console.error("❌ EMAIL SEND FAILED:", error?.message || error);
      console.error("Full error:", JSON.stringify(error, null, 2));
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




