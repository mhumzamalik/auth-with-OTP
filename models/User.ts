import mongoose, { Document, Model, Schema } from "mongoose";

/** User roles within the system */
export type UserRole = "user" | "admin";

/** Mongoose document interface for User */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  role: UserRole;
  avatar?: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Never returned in queries by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: undefined,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const record = ret as Record<string, unknown>;
        delete record["passwordHash"];
        delete record["__v"];
        return ret;
      },
    },
  }
);

/** Index for fast email lookups */
UserSchema.index({ email: 1 });

/** Compound index for lock checking */
UserSchema.index({ email: 1, lockUntil: 1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
