import React, { useState } from "react";

const RechargeDetailModal = ({ isOpen, onClose, onSubmit, selectedOption }) => {
  const [amount, setAmount] = useState("");

  if (!isOpen || !selectedOption) return null;

  const handleSubmit = () => {
    if (!amount) {
      alert("Please enter amount!");
      return;
    }
    onSubmit({ amount, ...selectedOption });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-md shadow-lg w-11/12 md:w-1/3">
        <h2 className="text-xl mb-4">Recharge Option Details</h2>
        <p className="mb-2">
          <strong>Account:</strong> {selectedOption.account}
        </p>
        <p className="mb-2">
          <strong>Details:</strong> {selectedOption.details}
        </p>
        <p className="mb-2">
          <strong>Payment Option:</strong> {selectedOption.paymentOption}
        </p>
        <p className="mb-4">
          <strong>Timestamp:</strong>{" "}
          {new Date(selectedOption.timestamp).toLocaleString()}
        </p>
        <label className="block mb-2">
          Amount:
          <input
            type="number"
            className="block w-full mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="block mb-4">
          Enter PIN to Complete the STK Push Transaction
        </label>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
          onClick={handleSubmit}
        >
          Authorize
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RechargeDetailModal;
