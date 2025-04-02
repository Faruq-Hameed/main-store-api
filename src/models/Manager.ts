import mongoose, { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IManager extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phonenumber: string;
  role: 'manager' | 'admin';
  status: 'active' | 'restricted' | 'blocked' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const ManagerSchema = new Schema<IManager>(
  {
    firstname: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    lastname: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phonenumber: {
      type: String,
      required: [true, 'Please add a phonenumber'],
      trim: true,
      lowercase: true,
      maxlength: [11, 'Number cannot be more than 11 characters'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [
        6,
        'Password must be at least 8 Alphanumeric with special characters',
      ],
    },
    role: {
      type: String,
      enum: ['manager', 'admin'],
      default: 'manager',
    },
  },
  {
    timestamps: true,
  },
);

// Encrypt password using bcrypt
ManagerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// match manager entered password to hashed password in database
ManagerSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

//remove them when return the object as part of a response
ManagerSchema.methods.toJSON = function () {
  const managerObject = this.toObject();
  delete managerObject.password; // remove the password field
  delete managerObject.__v; // remove the __v field
  return managerObject;
};

export default model<IManager>('Manager', ManagerSchema);
