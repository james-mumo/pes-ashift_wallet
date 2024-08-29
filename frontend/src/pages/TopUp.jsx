import React, { useEffect, useState } from "react";
import TransactionBox from "../components/TransactionBox";
import { SideBar } from "../components/SideBar";
import { useSetRecoilState } from "recoil";
import { transactionAtom } from "../store/atom/TransactionInfo";
import TransactionDiv from "../components/TransactionDiv";
import axios from "../axios";
import noTran from "../assets/imgs/no-transaction.png";
import { SideBarOpen } from "../store/atom/sideBarAtom";
import loading from "../assets/imgs/Loading Square.gif";
import RechargeDetailModal from "../components/RechargeDetailModal";

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [paymentOption, setPaymentOption] = useState("");
  const [details, setDetails] = useState("");
  const [account, setAccount] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ paymentOption, details, account });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-md shadow-lg">
        <h2 className="text-xl mb-4">Add Payment Details</h2>
        <label className="block mb-2">
          Payment Option:
          <select
            className="block w-full mt-1"
            value={paymentOption}
            onChange={(e) => setPaymentOption(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Mpesa">Mpesa</option>
            <option value="KCB-Mobile">KCB-Mobile</option>
            <option value="Equity-Mobile">Equity-Mobile</option>
          </select>
        </label>
        <label className="block mb-2">
          Details:
          <input
            type="text"
            className="block w-full mt-1"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>
        <label className="block mb-4">
          Account Number:
          <input
            type="number"
            className="block w-full mt-1"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </label>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const TopUp = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [rechargeOptions, setRechargeOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const setTransactionInfo = useSetRecoilState(transactionAtom);
  const setSideBarOpen = useSetRecoilState(SideBarOpen);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    setSideBarOpen(false);
  }, [setSideBarOpen]);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const token = `Bearer ${localStorage.getItem("token")}`;

      try {
        const [response1, response2, response3] = await Promise.all([
          axios.get("/account/info", { headers: { authorization: token } }),
          axios.get("/account/transactions", {
            headers: { authorization: token },
          }),
          axios.get("/recharge/recharges", {
            headers: { authorization: token },
          }), // Fetch recharge options
        ]);

        setTransactionInfo((info) => ({
          ...info,
          display: false,
          firstName: response1.data.firstName,
          lastName: response1.data.lastName,
          accountId: response1.data.accountId,
        }));

        setTransactions(response2.data.transactions);
        setRechargeOptions(response3.data);
        console.log(response3.data);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setErrMsg(error?.response?.data?.message || "No Server Response");
      }
    })();
  }, []);

  const [monthlyTransactions, setMonthlyTransactions] = useState([]);

  // useEffect(() => {
  //   // const CalculateMonthlyTransactions = () => {
  //   //   let monthlyTrans = {};
  //   //   transactions.forEach((transaction) => {
  //   //     const date = new Date(transaction.time);
  //   //     const month = `${date.toLocaleString("default", {
  //   //       month: "long",
  //   //     })}-${date.getFullYear()}`;
  //   //     if (!monthlyTrans[month]) {
  //   //       monthlyTrans[month] = [];
  //   //     }
  //   //     monthlyTrans[month].push(transaction);
  //   //   });
  //   //   monthlyTrans = Object.entries(monthlyTrans).sort(
  //   //     (month1, month2) =>
  //   //       new Date(month2[1][0].time) - new Date(month1[1][0].time)
  //   //   );
  //   //   monthlyTrans.forEach((monthTransactions) => {
  //   //     monthTransactions[1].sort(
  //   //       (tran1, tran2) => new Date(tran2.time) - new Date(tran1.time)
  //   //     );
  //   //   });

  //   //   setMonthlyTransactions(monthlyTrans);
  //   // };

  //   CalculateMonthlyTransactions();
  //   transactions.length ? setIsLoading(false) : null;
  // }, [transactions]);

  const handleAddOption = () => {
    setModalOpen(true);
  };

  const handleTopUp = async ({ paymentOption, details, account }) => {
    if (!paymentOption || !details || !account) {
      setErrMsg("Please complete all fields.");
      return;
    }
    try {
      const token = `Bearer ${localStorage.getItem("token")}`;
      await axios.post(
        "/recharge/recharge",
        { paymentOption, details, account },
        {
          headers: { authorization: token },
        }
      );
      // Handle successful top-up (e.g., refresh recharge options)
      setModalOpen(false);
      // Refresh recharge options
      const response = await axios.get("/recharge/recharges", {
        headers: { authorization: token },
      });
      setRechargeOptions(response.data);
    } catch (error) {
      setErrMsg(error?.response?.data?.message || "Top-up failed");
    }
  };

  const handleAuthorizeTopUp = async ({
    amount,
    paymentOption,
    details,
    account,
  }) => {
    console.log({ amount, paymentOption, details, account });
    if (!amount) {
      alert("Please complete all fields.");
      return;
    }
    try {
      const token = `Bearer ${localStorage.getItem("token")}`;
      await axios.post(
        "/account/deposit",
        { amount, paymentOption, details, account },
        {
          headers: { authorization: token },
        }
      );
      // Handle successful authorization

      setDetailModalOpen(false);
      // Refresh recharge options
      const response = await axios.get("/recharge/recharges", {
        headers: { authorization: token },
      });
      setRechargeOptions(response.data);
    } catch (error) {
      setErrMsg(error?.response?.data?.message || "Authorization failed");
    }
  };

  return (
    <>
      {errMsg && (
        <div className="text-6xl bg-black flex justify-center items-center text-white w-full h-[100vh]">
          {errMsg}
        </div>
      )}
      {isLoading ? (
        <div className="text-4xl sm:text-6xl bg-black flex flex-col justify-center items-center text-white w-full h-[100vh]">
          <img src={loading} alt="" className="w-[50%] sm:w-[40%] md:w-[30%]" />
          Loading...
        </div>
      ) : (
        <div className="flex bg-black w-full h-full min-h-[100dvh]">
          <TransactionBox />
          <SideBar active="TopUp" />
          <div className="bg-black text-white w-full h-full">
            <div className="flex p-10 flex-col ">
              <div className="flex items-center gap-5 justify-start mt-5 mb-10 ">
                <button
                  className="block w-6 sm:w-8 lg:hidden"
                  onClick={() => setSideBarOpen((prev) => !prev)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    data-name="Layer 261"
                    viewBox="0 0 46.99 46.88"
                    id="Menu"
                  >
                    <rect
                      width="23.5"
                      height="9.29"
                      x="23.5"
                      fill="#ffffff"
                      rx="4.64"
                      className="color231f20 svgShape"
                    />
                    <rect
                      width="9.41"
                      height="9.29"
                      x=".28"
                      fill="#ffffff"
                      rx="4.64"
                      className="color231f20 svgShape"
                    />
                    <rect
                      width="9.41"
                      height="9.29"
                      x="37.52"
                      y="37.59"
                      fill="#ffffff"
                      rx="4.64"
                      className="color231f20 svgShape"
                    />
                    <rect
                      width="23.5"
                      height="9.29"
                      x=".47"
                      y="37.59"
                      fill="#ffffff"
                      rx="4.64"
                      className="color231f20 svgShape"
                    />
                    <rect
                      width="46.99"
                      height="9.29"
                      y="18.85"
                      fill="#ffffff"
                      rx="4.64"
                      className="color231f20 svgShape"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl sm:text-4xl">TopUp Wallet</h1>
              </div>

              {!rechargeOptions.length ? (
                <div className="flex flex-col gap-5 pt-20 justify-center items-center">
                  <div className="flex flex-col">
                    <img
                      src={noTran}
                      className="w-[20%] h-[20%] min-w-60"
                      alt="No Transactions"
                    />
                    <h1 className="text-4xl">No Recharge Options Added</h1>
                  </div>
                  <button
                    className="bg-yellow-700 text-white px-6 py-3 rounded-md shadow-md hover:bg-yellow-600 transition-colors duration-300"
                    onClick={handleAddOption}
                  >
                    Add Now
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex w-full text-yellow-400 font-semibold text-sm">
                    <div className="flex flex-1">Added Recharge Options</div>
                    <button
                      className="bg-yellow-700 w-fit text-white px-2 py-1 rounded-md shadow-md hover:bg-yellow-600 transition-colors duration-300"
                      onClick={handleAddOption}
                    >
                      Add New
                    </button>
                  </div>
                  <div className="flex flex-col border sm:flex-row sm:mt-1 gap-5 justify-start items-center w-full sm:w-[70%] md:w-full">
                    {rechargeOptions.map((option) => (
                      <div
                        className="flex flex-col px-3 min-w-[40%] items-center justify-stretch"
                        key={option._id}
                      >
                        <div className="bg-gray-800 p-4 rounded-md shadow-md mb-4 text-yellow-400">
                          <h2 className="text-xl font-semibold">
                            Recharge Option
                          </h2>
                          <p>
                            <strong>Account:</strong> {option.account}
                          </p>
                          <p>
                            <strong>Details:</strong> {option.details}
                          </p>
                          <p>
                            <strong>Payment Option:</strong>{" "}
                            {option.paymentOption}
                          </p>
                          <p>
                            <strong>Timestamp:</strong>{" "}
                            {new Date(option.timestamp).toLocaleString()}
                          </p>
                          <button
                            className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
                            onClick={() => {
                              setSelectedOption(option);
                              setDetailModalOpen(true);
                            }}
                          >
                            Authorize
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleTopUp}
      />
      <RechargeDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSubmit={handleAuthorizeTopUp}
        selectedOption={selectedOption}
      />
    </>
  );
};

export default TopUp;
