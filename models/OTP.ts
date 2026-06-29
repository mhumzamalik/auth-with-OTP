import mongoose, { Document, Model, Schema } from "mongoose";

export type OtpType = "email-verification" | "password-reset";

export interface IOTP extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hashedOtp: string;
  type: OtpType;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email-verification", "password-reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OTPSchema.index({ userId: 1, type: 1 });

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: Model<IOTP> =
  mongoose.models.OTP ?? mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
