import React from "react";
import { Link } from "react-router-dom";
import { IoWalletOutline } from "react-icons/io5";

const Balance = ({ amount }) => {
  return (
    <div className="rounded-md shadow-custom flex w-full mx-3 my-6 py-6 lg:py-8  p-1 sm:p-5  lg:h-[200px] justify-center md:justify-start gap-7 items-center  flex-gro   bg-[#1A1A1A]">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          id="wallet"
          className="fill-current hidden sm:block text-yellow-500 w-16 h-16 lg:w-20 lg:h-20 "
        >
          <path d="M93 48.627h-.5V34.968c0-4.263-3.157-7.792-7.254-8.398v-3.073c0-4.687-3.813-8.5-8.5-8.5H72.98l-1.983-5.285a1.5 1.5 0 0 0-1.864-.901l-19.201 6.186H10.735c-3.989 0-7.235 3.246-7.235 7.235V82.76c0 4.687 3.813 8.5 8.5 8.5h72c4.687 0 8.5-3.813 8.5-8.5V69.101h.5c1.93 0 3.5-1.57 3.5-3.5V52.127c0-1.929-1.57-3.5-3.5-3.5zM74.106 17.998h2.64c3.032 0 5.5 2.467 5.5 5.5v2.971h-4.961l-.299-.797-2.88-7.674zm-4.33-3 2.437 6.494 1.868 4.977H24.109l44.582-14.362 1.085 2.891zm-59.041 3h29.884l-18.84 6.07-7.453 2.401h-3.591c-2.335 0-4.235-1.9-4.235-4.235s1.9-4.236 4.235-4.236zM89.5 82.76c0 3.033-2.468 5.5-5.5 5.5H12a5.506 5.506 0 0 1-5.5-5.5V28.096c.021.016.046.026.068.042.262.185.535.354.821.504.053.028.109.052.163.079.265.131.538.246.82.344.048.017.094.036.142.052.312.101.633.177.962.235.073.013.147.023.221.034.34.049.685.083 1.038.083H84c3.032 0 5.5 2.467 5.5 5.5v13.659h-9.938c-4.687 0-8.5 3.813-8.5 8.5v3.474c0 4.687 3.813 8.5 8.5 8.5H89.5V82.76zm4-17.159a.5.5 0 0 1-.5.5H79.562a5.506 5.506 0 0 1-5.5-5.5v-3.474c0-3.033 2.468-5.5 5.5-5.5H93a.5.5 0 0 1 .5.5v13.474z"></path>
          <path d="M83.449 54.522a4.347 4.347 0 0 0-4.343 4.342c0 2.395 1.948 4.342 4.343 4.342s4.342-1.948 4.342-4.342a4.347 4.347 0 0 0-4.342-4.342zm0 5.685c-.74 0-1.343-.602-1.343-1.342a1.343 1.343 0 0 1 2.685 0c0 .739-.602 1.342-1.342 1.342z"></path>
        </svg>
      </div>
      <div className="flex flex-row justify-center w-full">
        <div className="flex flex-col flex-1">
          <div className="text-sm text-[#7e7e7e]">Current balance</div>
          <div className="text-4xl lg:text-5xl font-semibold">
            Ksh{parseFloat(amount).toLocaleString("en-KE")}
          </div>
        </div>
        <div className="flex">
          <Link to={"/topup"}>
            <h5 className="text-yellow-300 items-center gap-1 flex font-semibold text-sm ml-4  sm:ml-0 sm:text-md">
              <IoWalletOutline />
              Top Up
            </h5>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Balance;
