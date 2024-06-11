import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RPSAbi, RPSByteCode } from "./contractAbi";
import {
  generateSalt,
  setSecureCookie,
  moves,
  deriveKey,
  encryptSalt,
} from "./utils";

const CreateGame = ({ setisLoading, provider }) => {
  const [selectedMove, setselectedMove] = useState(null);
  const [wei, setwei] = useState("");
  const [p2Address, setp2Address] = useState("");
  const [pwd, setpwd] = useState("");
  const [contract, setContract] = useState(null);

  const resetData = () => {
    setwei("");
    setselectedMove(null);
    setp2Address("");
    setpwd("");
  };

  const isValidGame = () => {
    if (
      p2Address !== null &&
      p2Address.length === 42 &&
      p2Address.startsWith("0x") &&
      selectedMove !== null &&
      wei !== "0" &&
      wei !== null &&
      pwd !== ""
    ) {
      return true;
    }
    return false;
  };

  const deployContract = async () => {
    if (provider) {
      setisLoading(true);
      const signer = provider.getSigner();
      const salt = generateSalt(32);
      const saltForKDF = generateSalt(16); // Salt for key derivation
      const key = await deriveKey(pwd, saltForKDF);
      const { iv, encryptedSalt } = await encryptSalt(salt, key);
      const encryptedSaltArray = Array.from(encryptedSalt);
      const signature = await signer.signMessage(encryptedSaltArray);
      const moveHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["string", "bytes32"],
          [parseInt(selectedMove) + 1, ethers.utils.hexlify(salt)]
        )
      );
      const ContractFactory = new ethers.ContractFactory(
        RPSAbi,
        RPSByteCode,
        signer
      );
      const deployedContract = await ContractFactory.deploy(
        moveHash,
        p2Address,
        {
          value: ethers.utils.parseUnits(wei.toString(), "wei"),
        }
      );
      await deployedContract.deployed();
      localStorage.setItem("signature", signature);
      localStorage.setItem(
        "encryptedSalt",
        JSON.stringify({ iv: Array.from(iv), data: Array.from(encryptedSalt) })
      );
      localStorage.setItem(
        "saltForKDF",
        JSON.stringify(Array.from(saltForKDF))
      );
      localStorage.setItem("RPSAddress", deployedContract.address);
      setContract(deployedContract);
      console.log(deployedContract.address);
      resetData();
      setisLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-4 my-4 w-full">
        {moves.map((m, i) => (
          <kbd
            onClick={() => setselectedMove(i)}
            className={`kbd ${selectedMove === i ? "bg-primary text-white" : null}`}
          >
            {m}
          </kbd>
        ))}
      </div>
      <div className="w-full flex justify-center my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="number"
            value={wei}
            onChange={(e) => setwei(e.target.value)}
            className="grow"
            placeholder="Enter Amount"
          />
          <kbd className="kbd kbd-sm">wei</kbd>
        </label>
      </div>
      <div className="w-full flex justify-center my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={p2Address}
            onChange={(e) => setp2Address(e.target.value)}
            className="grow"
            placeholder="Player 2 Address"
          />
          {/* <kbd className="kbd kbd-sm">addr</kbd> */}
          <div className="label">
            {p2Address !== null &&
            p2Address.length !== 42 &&
            p2Address !== "" ? (
              <span className="label-text-alt text-red-600">
                Invalid Address
              </span>
            ) : null}
          </div>
        </label>
      </div>
      <div className="w-full flex justify-center my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={pwd}
            onChange={(e) => setpwd(e.target.value)}
            className="grow"
            placeholder="Password"
          />
          <kbd className="kbd kbd-sm">🔑</kbd>
        </label>
      </div>
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={deployContract}
          className={`btn btn-primary flex items-center w-72 `}
          disabled={`${isValidGame() ? "" : "disabled"}`}
        >
          Start Game
        </button>
      </div>
      <div className="w-full flex justify-center my-0">
        <button
          className={`btn btn-link text-xs flex items-center w-72 `}
          onClick={resetData}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CreateGame;
