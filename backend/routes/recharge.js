const express = require("express");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware");
const { Recharge, User } = require("../bd");

const rechargeRouter = express.Router();

rechargeRouter.post("/recharge", authMiddleware, async (req, res) => {
  const { paymentOption, details, account } = req.body;
  console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    return res.status(400).json({
      message: "Invalid user Id",
    });
  }

  if (!["Mpesa", "KCB-Mobile", "Equity-Mobile"].includes(paymentOption)) {
    return res.status(400).json({
      message: "Invalid payment option",
    });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const recharge = new Recharge({
      userId: req.userId,
      paymentOption,
      details,
      account,
    });

    await recharge.save();
    res.status(201).json({
      message: "Recharge option added successfully",
      recharge,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// Get all recharge options for a user
rechargeRouter.get("/recharges", authMiddleware, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    return res.status(400).json({
      message: "Invalid user Id",
    });
  }

  try {
    const recharges = await Recharge.find({ userId: req.userId }).sort({
      timestamp: -1,
    });
    res.json(recharges);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

module.exports = rechargeRouter;
