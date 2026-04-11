const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    type: {
      type: String,
      enum: ['participation', 'completion', 'appreciation', 'custom'],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    pdfUrl: {
      type: String, // Firebase Storage download URL
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
certificateSchema.index({ issuedTo: 1, issuedAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
