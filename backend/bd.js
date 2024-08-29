const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

try {
  mongoose.connect(process.env.DATABASE_URI);
} catch (err) {
  console.log(err);
}

// User schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: "#90EE90",
  },
});

// Hash and password check methods
userSchema.methods.createHash = async (plainTextPassword) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
};

userSchema.methods.checkPassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

// Account schema
const accountSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    unique: true,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0, // Set a default balance of 0
  },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transactions" }],
});

// Transaction schema
const transactionsSchema = mongoose.Schema({
  senderAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false, // Not required for deposits
    index: true,
  },
  receiverAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false, // Not required for withdrawals
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
  },
});

// Recharge schema
const rechargeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  paymentOption: {
    type: String,
    enum: ["Mpesa", "KCB-Mobile", "Equity-Mobile"],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Models
const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("Users", userSchema);
const Transaction = mongoose.model("Transactions", transactionsSchema);
const Recharge = mongoose.model("RechargeOptions", rechargeSchema);

module.exports = {
  User,
  Account,
  Transaction,
  Recharge,
};
