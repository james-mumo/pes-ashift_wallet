import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { transactionAtom } from "../store/atom/TransactionInfo";

const History = ({ transactions }) => {
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
  //   const date = new Date(transaction?.time);

  //   const time = `${date.toLocaleString("default", {
  //     month: "short",
  //   })} ${date.getDate()}, ${date.getFullYear()} ${date.getHours() % 12 || 12}:${
  //     date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`
  //   } ${date.getHours() > 12 ? "PM" : "AM"}`;

  return (
    <div className="  w-full rounded-md row-auto mx-3   justify-center md:justify-start gap-7   flex flex-col   bg-[#1A1A1A]">
      <div className=" pt-10 px-3 xs:px-6 flex items-baseline justify-between">
        <h1 className=" text-lg sm:text-xl">Recent Transactions</h1>
        <Link to={"/transactions"}>
          <h5 className="text-yellow-300 text-xs ml-4  sm:ml-0 sm:text-sm">
            See all
          </h5>
        </Link>
      </div>
      <div className="mb-5">
        {!transactions.length ? (
          <div className="text-center text-2xl my-10">No Transactions</div>
        ) : (
          transactions.map((transaction) => (
            <div
              className="flex justify-between items-center cursor-pointer  py-3 rounded-md	 px-5 hover:bg-[#373636]"
              onClick={() => showTransaction(transaction)}
            >
              {console.log(transaction)}
              <div className="flex gap-5 items-center">
                <div
                  className="w-6 h-6 xs:w-8 xs:h-8 flex text-center font-bold items-center justify-center uppercase rounded-full border-[1px] border-[#3a3a3a]"
                  style={{ background: transaction?.accountInfo?.avatar }}
                >
                  {transaction?.accountInfo.userInfo?.firstName}
                </div>
                <div>
                  <div className="text-sm xs:text-md">
                    {transaction?.accountInfo?.userInfo?.firstName +
                      " " +
                      transaction?.accountInfo?.userInfo?.lastName}
                  </div>
                  <div className="text-xs xs:text-sm text-[#7e7e7e]">
                    {/* {time} */}
                  </div>
                </div>
              </div>
              <div
                className={`${
                  transaction?.type == "credit" ? "text-green-700" : ""
                } `}
              >
                {transaction?.type == "credit" ? "+" : null}Ksh
                {transaction?.amount}
              </div>
            </div>
          ))
        )}
      </div>
      <div></div>
    </div>
  );
};

// const TransactionDiv_ = ({ transaction }) => {
//   console.log(transaction);

//   return (

//   );
// };

export default History;
