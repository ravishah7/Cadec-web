// backend/src/models/Event.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  image?: string;
  category: string;
  maxAttendees?: string;
  currentAttendees: number;
  price: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isRegistrationOpen: boolean;
  registrationDeadline?: Date;
  registrationFormType: 'internal' | 'external';   // ← NEW
  externalFormLink?: string;                         // ← NEW
  questions: {
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  maxAttendees: {
    type: String
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  price: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
],
    default: 'upcoming'
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  },
  registrationFormType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal'                              // ← NEW
  },
  externalFormLink: {
    type: String,
    default: ''                                      // ← NEW
  },
  questions: [{
    id: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'radio', 'checkbox'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      type: String
    }],
    placeholder: {
      type: String
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);