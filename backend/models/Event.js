import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    organizer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue location is required'],
    },
    event_date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    event_time: {
      type: String,
      required: [true, 'Event time schedule is required'],
    },
    registration_deadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    max_capacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    seats_remaining: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
