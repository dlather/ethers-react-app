import React, { useState } from "react";
import { ethers } from "ethers";
import { RPSAbi } from "./contractAbi";
import { moves } from "./utils";

const JoinGame = ({ provider }) => {
  const [gameAddress, setgameAddress] = useState("");
  const [selectedMove, setselectedMove] = useState(null);
  const [txn, settxn] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  const playMove = async () => {
    if (provider) {
      setisLoading(true);
      try {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(gameAddress, RPSAbi, provider);
        const stake = await contract.stake();
        const contractWithSigner = contract.connect(signer);
        const txn = await contractWithSigner.play(parseInt(selectedMove) + 1, {
          value: stake,
          gasLimit: 300000,
        });
        settxn(txn);
        await txn.wait();
      } catch (err) {
        console.log(err);
      } finally {
        setisLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto h-screen ">
        <span className="loading loading-ring loading-lg"></span>
        {txn ? (
          <a
            className="mt-4"
            href={`https://sepolia.etherscan.io/tx/${txn.hash}`}
            target="_blank"
            rel="noreferrer"
          >
            Transaction Hash
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mx-auto items-center justify-center">
      <p className="mt-6 mb-1 text-gray-500">Choose your move</p>
      <div className="flex justify-center my-2 gap-4 w-full">
        {moves.map((m, i) => (
          <kbd
            key={i}
            onClick={() => {
              if (selectedMove === i) {
                setselectedMove(null);
              } else {
                setselectedMove(i);
              }
            }}
            className={`kbd ${selectedMove === i ? "bg-primary text-white" : null}`}
          >
            {m}
          </kbd>
        ))}
      </div>
      <div className="my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={gameAddress}
            onChange={(e) => setgameAddress(e.target.value)}
            className="grow"
            placeholder="Enter Game Address"
          />
          {/* <kbd className="kbd kbd-sm">addr</kbd> */}
        </label>
      </div>
      <div className="label">
        {gameAddress !== null &&
        gameAddress !== "" &&
        !ethers.utils.isAddress(gameAddress) ? (
          <span className="label-text-alt text-red-600">Invalid Address</span>
        ) : null}
      </div>
      <div className=" mt-2">
        <button
          onClick={playMove}
          className={`btn btn-primary flex items-center w-72 `}
          disabled={`${selectedMove !== null && ethers.utils.isAddress(gameAddress) ? "" : "disabled"}`}
        >
          Play
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
