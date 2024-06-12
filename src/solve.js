import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Timer from "./components/timer";
import { HasherAbi } from "./contractAbi";
import { deriveKey, decryptSalt, HashContractAddress } from "./utils";

const SolveGame = ({ provider, contract }) => {
  const [c2Move, setc2Move] = useState(null);
  const [timeout, settimeout] = useState(null); // seconds
  const [lastAction, setlastAction] = useState(null);
  const [j2, setj2] = useState(null);
  const [reload, setreload] = useState(false);
  const currTime = (Date.now() / 1000).toFixed();
  const [txn, settxn] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [pwd, setpwd] = useState(null);

  const reloadPage = () => {
    setreload(!reload);
  };

  const fetchData = async () => {
    if (contract) {
      setisLoading(true);
      try {
        const c2 = await contract.c2();
        setc2Move(c2);
        const timeout = await contract.TIMEOUT();
        settimeout(ethers.BigNumber.from(timeout._hex).toNumber());
        const lastAct = await contract.lastAction();
        setlastAction(ethers.BigNumber.from(lastAct._hex).toNumber());
        const p2 = await contract.j2();
        setj2(p2);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setisLoading(false);
      }
    }
  };

  const p1TimeOut = async () => {
    setisLoading(true);
    try {
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const txn = await contractWithSigner.j2Timeout();
      settxn(txn);
      await txn.wait();
      localStorage.clear();
    } catch (err) {
      console.error("Error p1TimeOut", err);
    } finally {
      setisLoading(false);
    }
  };

  const settleGame = async () => {
    setisLoading(true);
    try {
      const providersigner = provider.getSigner();
      const p1Address = await providersigner.getAddress();

      const encryptedSaltData = JSON.parse(
        localStorage.getItem("encryptedSalt")
      );
      const encryptedSalt = new Uint8Array(encryptedSaltData.data);
      const iv = new Uint8Array(encryptedSaltData.iv);
      const signature = localStorage.getItem("signature");
      const saltForKDF = new Uint8Array(
        JSON.parse(localStorage.getItem("saltForKDF"))
      );
      const key = await deriveKey(pwd, saltForKDF);
      const decryptedSalt = await decryptSalt(encryptedSalt, key, iv);
      const signer = ethers.utils.verifyMessage(encryptedSalt, signature);

      if (signer === p1Address) {
        const c1Hash = await contract.c1Hash();
        let prevMove = 0;
        for (let i = 1; i <= 5; i++) {
          const saltHex = ethers.utils.hexlify(decryptedSalt);
          const saltBigNumber = ethers.BigNumber.from(saltHex);
          const hasherContract = new ethers.Contract(
            HashContractAddress,
            HasherAbi,
            provider
          );
          const hasherMoveHash = await hasherContract.hash(i, saltBigNumber);
          if (hasherMoveHash === c1Hash) {
            prevMove = i;
            break;
          }
        }

        const contractWithSigner = contract.connect(providersigner);
        const txn = await contractWithSigner.solve(prevMove, decryptedSalt, {
          gasLimit: 300000,
        });
        settxn(txn);
        await txn.wait();
        localStorage.clear();
      }
    } catch (err) {
      console.error("Error settleGame", err);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, reload]);

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
    <div className="my-4">
      {c2Move === 0 ? (
        <div className="justify-center items-center flex flex-col">
          {parseInt(lastAction) + parseInt(timeout) < parseInt(currTime) ? (
            <div className="flex justify-between items-center w-full">
              <p className="text-lg font-semibold">Player 2 Timed out</p>
              <button className="btn btn-primary" onClick={p1TimeOut}>
                Get Stake Back
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <p className="text-lg font-semibold">Turn for Player 2</p>
              <Timer
                deadline={parseInt(lastAction) + parseInt(timeout)}
                reloadPage={reloadPage}
              />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="table">
              <tbody>
                <tr>
                  <th>Game Address</th>
                  <td>{contract.address}</td>
                </tr>
                <tr>
                  <th>Player Address</th>
                  <td>{j2}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="justify-center items-center flex flex-col">
          <div className="flex justify-between items-center w-full">
            <div className=" my-4">
              <label className="input input-bordered flex items-center w-72">
                <input
                  type="text"
                  value={pwd}
                  onChange={(e) => setpwd(e.target.value)}
                  className="grow"
                  placeholder="Password"
                />
                <kbd className="">🔑</kbd>
              </label>
            </div>
            <Timer
              deadline={parseInt(lastAction) + parseInt(timeout)}
              reloadPage={reloadPage}
            />
          </div>
          <button
            className="btn btn-primary btn-wide mt-4"
            onClick={settleGame}
            disabled={`${pwd !== null && pwd !== "" ? "" : "disabled"}`}
          >
            Settle Game
          </button>
        </div>
      )}
    </div>
  );
};

export default SolveGame;
