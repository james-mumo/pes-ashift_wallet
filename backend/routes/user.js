const express = require("express");
const zod = require("zod");

const mongoose = require("mongoose");
const rootRouter = require("./index.js");
const { User, Account, Transaction } = require("../bd.js");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { authMiddleware } = require("../middleware.js");

const userRouter = express.Router();

const signupBodySchema = zod
  .object({
    username: zod.string().email(),
    password: zod.string().min(8),
    firstName: zod.string().max(150),
    lastName: zod.string().max(150),
  })
  .refine((data) => {
    if (data.password.includes(" ")) {
      return false;
    }
    return true;
  });

userRouter.post("/signup", async (req, res) => {
  const { success } = signupBodySchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid inputs",
      h: req.body,
    });
  }
  const existingUser = await User.findOne({ username: req.body.username });

  if (existingUser) {
    return res.status(411).json({
      message: "User Already Exist",
      h: req.body,
    });
  }
  const darkColors = [
    "#4D8FAC",
    "#4C8E4C",
    "#8B3E3E",
    "#B45341",
    "#B06A7A",
    "#4D85A9",
    "#424C54",
    "#7A8EAB",
    "#B5B590",
    "#B0AE87",
  ];

  const user = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    avatar: darkColors[Math.floor(Math.random() * 10)],
  });
  user.password = await user.createHash(req.body.password);
  const userId = user._id;
  await user.save();
  await Account.create({
    userId: userId,
    balance: 0,
  });

  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({
    message: "user created successfully",
    token: token,
  });
});
const signinBodySchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
userRouter.post("/signin", async (req, res) => {
  const { success } = await signinBodySchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid Inputs",
    });
  }

  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(411).json({
      message: "Email not found",
    });
  }

  if (await user.checkPassword(req.body.password)) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    return res.json({
      token,
    });
  } else {
    return res.status(411).json({
      message: "Wrong Password!",
    });
  }
});

const updateBodySchema = zod
  .object({
    currentPassword: zod.string().min(8).optional(),
    newPassword: zod.string().min(8).optional(),
    firstName: zod.string().max(150).optional(),
    lastName: zod.string().max(150).optional(),
  })
  .refine((data) => {
    if (Object.keys(data).length == 0) {
      return false;
    }
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  });
userRouter.put("/change", authMiddleware, async (req, res) => {
  const { success } = await updateBodySchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Invalid inputs",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    return res.status(400).json({
      message: "Invalid user Id",
    });
  }
  const user = await User.findOne({ _id: req.userId });
  if (!user) {
    return res.status(403).json({
      message: "User not found",
    });
  }

  if (req.body.newPassword && req.body.currentPassword) {
    if (await user.checkPassword(req.body.newPassword)) {
      await User.updateOne({ _id: req.userId }, req.body);
      res.json({
        message: "Updated successfully",
      });
    } else {
      res.status(411).json({
        message: "Invalid Password",
      });
    }
  } else {
    await User.updateOne({ _id: req.userId }, req.body);
    res.json({
      message: "Updated successfully",
    });
  }
});

userRouter.get("/dashboard", authMiddleware, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    return res.status(400).json({ message: "Invalid user Id" });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Convert userId to ObjectId
  const userIdObjectId = new mongoose.Types.ObjectId(req.userId);

  // Aggregate pipeline to fetch transactions with user and account information
  const transactions = await Account.aggregate([
    { $match: { userId: userIdObjectId } },
    {
      $lookup: {
        from: "transactions",
        localField: "transactions",
        foreignField: "_id",
        as: "transactions",
      },
    },
    { $unwind: "$transactions" },
    {
      $lookup: {
        from: "accounts",
        localField: "transactions.senderAccountId",
        foreignField: "_id",
        as: "transactions.senderAccount",
      },
    },
    {
      $unwind: {
        path: "$transactions.senderAccount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "transactions.receiverAccountId",
        foreignField: "_id",
        as: "transactions.receiverAccount",
      },
    },
    {
      $unwind: {
        path: "$transactions.receiverAccount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "transactions.senderAccount.userId",
        foreignField: "_id",
        as: "transactions.senderUser",
      },
    },
    {
      $unwind: {
        path: "$transactions.senderUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "transactions.receiverAccount.userId",
        foreignField: "_id",
        as: "transactions.receiverUser",
      },
    },
    {
      $unwind: {
        path: "$transactions.receiverUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        transactionId: "$transactions._id",
        type: {
          $cond: {
            if: { $eq: ["$transactions.senderAccountId", null] },
            then: "credit",
            else: "debit",
          },
        },
        accountInfo: {
          $cond: {
            if: { $eq: ["$transactions.senderAccountId", null] },
            then: {
              accountId: "$transactions.receiverAccount._id",
              userInfo: "$transactions.receiverUser",
            },
            else: {
              accountId: "$transactions.senderAccount._id",
              userInfo: "$transactions.senderUser",
            },
          },
        },
        time: "$transactions.timestamp",
        amount: "$transactions.amount",
      },
    },
    { $sort: { "transactions.timestamp": -1 } },
    { $limit: 5 },
  ]);

  const account = await Account.findOne({ userId: userIdObjectId });
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    accountId: account._id,
    balance: account.balance,
    transactions: transactions,
  });
});

userRouter.get("/search", authMiddleware, async (req, res) => {
  const filters = req.query.filter?.split(" ") || [""];

  const users = await User.find({
    $and: filters.map((filter) => ({
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
        { username: { $regex: filter, $options: "i" } },
      ],
    })),
  })
    .limit(10)
    .exec();

  res.json({
    users: users
      .map((user) => {
        return user._id != req.userId
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              _id: user._id,
              avatar: user.avatar,
            }
          : null;
      })
      .filter((e) => e != null),
  });
});

module.exports = userRouter;
