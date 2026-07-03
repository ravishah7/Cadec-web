import mongoose, { Document, Schema } from "mongoose";

export type AuthProvider = "local" | "google";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  provider: AuthProvider;
  providerId?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "local";
      },
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    providerId: {
      type: String,
      default: null,
      sparse: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent model overwrite during development (useful with hot reload)
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);