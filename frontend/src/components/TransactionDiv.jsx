import React, { useEffect, useState } from "react";
import TransactionBox from "../components/TransactionBox";
import { SideBar } from "../components/SideBar";
import { useRecoilState, useSetRecoilState } from "recoil";
import { transactionAtom } from "../store/atom/TransactionInfo";

const TransactionDiv = ({ transaction }) => {
  console.log(transaction);
  const setTransactionInfo = useSetRecoilState(transactionAtom);

  function showTransaction(tran) {
    setTransactionInfo((info) => {
      return {
        ...info,
        display: true,
        transactionInfo: {
          transactionId: tran?.transactionId,
          type: tran?.type,
          accountInfo: {
            accountId: tran?.accountInfo.accountId,
            userInfo: {
              firstName: tran?.accountInfo?.firstName,
              lastName: tran?.accountInfo?.lastName,
              avatar: tran?.accountInfo?.avatar,
              userId: tran?.accountInfo?._id,
            },
          },
          time: tran?.time,
          amount: tran?.amount,
        },
      };
    });
  }
  const date = new Date(transaction?.time);

  const time = `${date.toLocaleString("default", {
    month: "short",
  })} ${date.getDate()}, ${date.getFullYear()} ${date.getHours() % 12 || 12}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`
  } ${date.getHours() > 12 ? "PM" : "AM"}`;
  return (
    <div
      className="flex justify-between items-center cursor-pointer  py-3 rounded-md	 px-5 hover:bg-[#373636]"
      onClick={() => showTransaction(transaction)}
    >
      <div className="flex gap-5 items-center">
        <div
          className="w-6 h-6 xs:w-8 xs:h-8 flex text-center font-bold items-center justify-center uppercase rounded-full border-[1px] border-[#3a3a3a]"
          style={{ background: transaction?.accountInfo?.avatar }}
        >
          {transaction?.accountInfo.firstName}
        </div>
        <div>
          <div className="text-sm xs:text-md">
            {transaction?.accountInfo?.firstName +
              " " +
              transaction?.accountInfo?.lastName}
          </div>
          <div className="text-xs xs:text-sm text-[#7e7e7e]">{time}</div>
        </div>
      </div>

      <div
        className={`${transaction?.type == "credit" ? "text-green-700" : ""} `}
      >
        {transaction?.type == "credit" ? "+" : null}Ksh{transaction?.amount}
      </div>
    </div>
  );
};

export default TransactionDiv;
