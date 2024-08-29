const express = require("express");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware");
const { Account, Transaction, User } = require("../bd");

const accountRouter = express.Router();

// Route to get account information
accountRouter.get("/info", authMiddleware, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    return res.status(400).json({ message: "Invalid user Id" });
  }

  const user = await User.findOne({ _id: req.userId });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const account = await Account.findOne({ userId: req.userId });
  if (!account) {
    return res.status(400).json({ message: "Account not found" });
  }

  res.json({
    accountId: account._id,
    firstName: user.firstName,
    lastName: user.lastName,
    balance: account.balance,
  });
});

// Route to handle money transfers

// Route to handle money transfers
accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  try {
    let { to, amount } = req.body;

    // Ensure amount is a number
    amount = Number(amount);
    if (isNaN(amount)) {
      throw new Error("Invalid amount");
    }

    // Validate inputs
    if (to === req.userId) {
      throw new Error("Cannot send money to yourself");
    }
    if (
      !mongoose.Types.ObjectId.isValid(to) ||
      !mongoose.Types.ObjectId.isValid(req.userId)
    ) {
      throw new Error("Invalid User Id");
    }

    // Fetch accounts
    const senderAccount = await Account.findOne({ userId: req.userId });
    const receiverAccount = await Account.findOne({ userId: to });

    // Validate accounts and balance
    if (!senderAccount || !receiverAccount) {
      throw new Error("Account not found");
    }
    if (amount > senderAccount.balance || amount <= 0) {
      throw new Error("Insufficient balance");
    }

    // Format amount to two decimal places
    amount = parseFloat(amount.toFixed(2));

    // Create a transaction
    const transaction = await Transaction.create({
      senderAccountId: senderAccount._id,
      receiverAccountId: receiverAccount._id,
      amount: amount,
      type: "transfer",
      timestamp: new Date(),
    });

    // Update sender and receiver accounts
    await Account.updateOne(
      { userId: req.userId },
      {
        $inc: { balance: -amount },
        $push: { transactions: transaction._id },
      }
    );

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount }, $push: { transactions: transaction._id } }
    );

    res.json({ message: "Transfer successful" });
  } catch (error) {
    res.status(400).json({
      message: error.message || "An error occurred during the transaction",
    });
  }
});

// Route to handle deposits

// Route to handle deposits
// Route to handle deposits
accountRouter.post("/deposit", authMiddleware, async (req, res) => {
  try {
    let { amount, details, accountNo } = req.body;

    if (amount <= 0) {
      throw new Error("Invalid deposit amount");
    }

    amount = parseFloat(parseFloat(amount).toFixed(2));

    const userAccount = await Account.findOne({ userId: req.userId });

    if (!userAccount) {
      throw new Error("Account not found");
    }

    const transaction = await Transaction.create({
      senderAccountId: userAccount._id, // Set senderAccountId to the user's account
      receiverAccountId: userAccount._id, // Also set receiverAccountId to the user's account
      amount: amount,
      type: "deposit",
      accountNo: accountNo,
      timestamp: new Date(),
      details: details,
    });

    // Update receiver account balance and push transaction reference
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: amount }, $push: { transactions: transaction._id } }
    );

    res.json({ message: "Deposit successful" });
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "An error occurred during deposit" });
  }
});

// Route to handle withdrawals
accountRouter.post("/withdraw", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { amount, description } = req.body;

    if (amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    const account = await Account.findOne({ userId: req.userId }).session(
      session
    );
    if (!account) {
      throw new Error("Account not found");
    }

    if (amount > account.balance) {
      throw new Error("Insufficient balance");
    }

    amount = parseFloat(parseFloat(amount).toFixed(2));

    const transaction = await Transaction.create(
      [
        {
          senderAccountId: account._id,
          amount: amount,
          type: "withdrawal",
          timestamp: Date.now(),
          description: description,
        },
      ],
      { session: session }
    );

    await Account.updateOne(
      { userId: req.userId },
      {
        $inc: { balance: -amount },
        $push: { transactions: transaction[0]._id },
      }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Withdrawal successful" });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    res.status(400).json({
      message: error.message || "An error occurred during withdrawal",
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// Route to get all transactions for the user
accountRouter.get("/transactions", authMiddleware, async (req, res) => {
  try {
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    // Find the account associated with the userId
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Fetch the transactions for the account
    const transactions = await Transaction.find({
      _id: { $in: account.transactions },
    });

    // Populate and format the transaction data
    const transactionDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const senderAccount = await Account.findById(
          transaction.senderAccountId
        );
        const senderUser = await User.findById(senderAccount.userId);

        return {
          transactionId: transaction._id,
          type: transaction.type,
          accountInfo: {
            firstName: senderUser.firstName,
            lastName: senderUser.lastName,
            avatar: senderUser.avatar,
            email: senderUser.username,
            balance: senderAccount.balance,
          },
          time: transaction.timestamp,
          amount: transaction.amount,
        };
      })
    );

    console.log(transactionDetails);

    res.json({
      transactions: transactionDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching transactions." });
  }
});

module.exports = accountRouter;
