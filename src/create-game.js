import React, { useState } from "react";
import { ethers } from "ethers";
import { RPSAbi, RPSByteCode } from "./contractAbi";
import {
  generateSalt,
  moves,
  deriveKey,
  encryptSalt,
  sanitizeInput,
  //   HashContractAddress,
} from "./utils";
import secureLocalStorage from "react-secure-storage";

const CreateGame = ({ provider, setContract }) => {
  const [selectedMove, setselectedMove] = useState(null);
  const [wei, setwei] = useState("");
  const [p2Address, setp2Address] = useState("");
  const [pwd, setpwd] = useState("");
  const [txn, settxn] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  const resetData = () => {
    setwei("");
    setselectedMove(null);
    setp2Address("");
    setpwd("");
    settxn(null);
  };

  const isValidGame = () => {
    if (
      p2Address !== null &&
      ethers.utils.isAddress(p2Address) &&
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
      try {
        const signer = provider.getSigner();
        const p1Address = await signer.getAddress();
        const salt = generateSalt(32);
        const saltForKDF = generateSalt(16); // Salt for key derivation
        const key = await deriveKey(pwd, saltForKDF);
        const { iv, encryptedSalt } = await encryptSalt(salt, key);
        const encryptedSaltArray = Array.from(encryptedSalt);
        const signature = await signer.signMessage(encryptedSaltArray);
        // const saltHex = ethers.utils.hexlify(salt);
        // const saltBigNumber = ethers.BigNumber.from(saltHex);
        // const hasherContract = new ethers.Contract(
        //   HashContractAddress,
        //   HasherAbi,
        //   provider
        // );
        // const hasherMoveHash = await hasherContract.hash(
        //   parseInt(selectedMove) + 1,
        //   saltBigNumber
        // );
        const hasherMoveHash = ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["uint8", "uint256"],
            [parseInt(selectedMove) + 1, ethers.BigNumber.from(salt)]
          )
        );
        // console.log(`moveHash: ${moveHash}`);
        const factory = new ethers.ContractFactory(RPSAbi, RPSByteCode, signer);
        const contract = await factory.deploy(hasherMoveHash, p2Address, {
          value: ethers.utils.parseUnits(wei.toString(), "wei"),
        });
        const txn = contract.deployTransaction;
        settxn(txn);
        await contract.deployTransaction.wait();
        //   await deployedContract.deployed();
        secureLocalStorage.setItem("signature", signature);
        secureLocalStorage.setItem(
          "encryptedSalt",
          JSON.stringify({
            iv: Array.from(iv),
            data: Array.from(encryptedSalt),
          })
        );
        secureLocalStorage.setItem(
          "saltForKDF",
          JSON.stringify(Array.from(saltForKDF))
        );
        secureLocalStorage.setItem("RPSAddress", contract.address);
        secureLocalStorage.setItem("p1Address", p1Address);
        secureLocalStorage.setItem("p2Address", p2Address);
        setContract(contract);
        resetData();
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
      <div className=" my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="number"
            value={wei}
            onChange={(e) => {
              if (sanitizeInput(e.target.value)) {
                setwei(e.target.value);
              }
            }}
            className="grow"
            placeholder="Enter Amount"
          />
          <kbd className="">wei</kbd>
        </label>
      </div>
      <div className="my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={p2Address}
            onChange={(e) => {
              if (sanitizeInput(e.target.value)) {
                setp2Address(e.target.value);
              }
            }}
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
      <div className=" my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={pwd}
            onChange={(e) => {
              if (sanitizeInput(e.target.value)) {
                setpwd(e.target.value);
              }
            }}
            className="grow"
            placeholder="Password"
          />
          <kbd className="">🔑</kbd>
        </label>
      </div>
      <div className=" mt-4">
        <button
          onClick={deployContract}
          className={`btn btn-primary flex items-center w-72 `}
          disabled={`${isValidGame() ? "" : "disabled"}`}
        >
          Create Game
        </button>
      </div>
      <div className=" my-0">
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
