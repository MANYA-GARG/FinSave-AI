import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
     password: {
        type: String,
        required: true,
    },
    isMfaActive: {
        type:Boolean,
        required: false,
    },
    twoFactorSecret:{
        type:String,
    },   
     // ✅ [NEW] Wallet & Security Additions
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  preferences: {
    currency: { type: String, default: "INR" },
    notificationSettings: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
    },
    thresholdAmountForApproval: {
      type: Number,
      default: 5000,
    },
},
}, 
{
     timestamps:true,
}
);

const User = mongoose.model("User", userSchema);

export default User;