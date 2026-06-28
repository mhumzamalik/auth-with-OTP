import mongoose, { Document, Model, Schema } from "mongoose";

/** Enumeration of all loggable auth events */
export type AuthEventType =
  | "USER_REGISTERED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "EMAIL_VERIFIED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_CHANGED"
  | "LOGOUT"
  | "REFRESH_TOKEN_ROTATED"
  | "SESSION_REVOKED"
  | "SUSPICIOUS_REUSE_DETECTED";

/** Mongoose document interface for AuthLog */
export interface IAuthLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  event: AuthEventType;
  ip: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const AuthLogSchema = new Schema<IAuthLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    event: {
      type: String,
      enum: [
        "USER_REGISTERED",
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "ACCOUNT_LOCKED",
        "EMAIL_VERIFIED",
        "PASSWORD_RESET_REQUESTED",
        "PASSWORD_CHANGED",
        "LOGOUT",
        "REFRESH_TOKEN_ROTATED",
        "SESSION_REVOKED",
        "SUSPICIOUS_REUSE_DETECTED",
      ],
      required: true,
    },
    ip: {
      type: String,
      default: "0.0.0.0",
    },
    userAgent: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/** Index for user-specific log queries */
AuthLogSchema.index({ userId: 1, createdAt: -1 });

/** Index for event-type queries */
AuthLogSchema.index({ event: 1, createdAt: -1 });

/** TTL index — retain logs for 90 days */
AuthLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }
);

const AuthLog: Model<IAuthLog> =
  mongoose.models.AuthLog ??
  mongoose.model<IAuthLog>("AuthLog", AuthLogSchema);

export default AuthLog;
