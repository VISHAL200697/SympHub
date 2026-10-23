import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    registered_at: {
      type: Date,
      default: Date.now,
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

// Prevent double registration via compound unique index
registrationSchema.index({ event_id: 1, student_id: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
