import mongoose, { Document, Model, Schema } from "mongoose";

/** Mongoose document interface for Session */
export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hashedRefreshToken: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  lastActive: Date;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hashedRefreshToken: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      default: "Unknown Device",
    },
    browser: {
      type: String,
      default: "Unknown Browser",
    },
    os: {
      type: String,
      default: "Unknown OS",
    },
    ip: {
      type: String,
      default: "0.0.0.0",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/** Index for fast user session lookups */
SessionSchema.index({ userId: 1 });

/** Index for token-based session lookups */
SessionSchema.index({ hashedRefreshToken: 1 });

/** Compound index for active session queries */
SessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

/** TTL index — clean up expired sessions automatically */
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session: Model<ISession> =
  mongoose.models.Session ??
  mongoose.model<ISession>("Session", SessionSchema);

export default Session;
