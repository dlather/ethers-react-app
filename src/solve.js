import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Timer from "./components/timer";

const SolveGame = ({ provider, contract }) => {
  const [c2Move, setc2Move] = useState(null);
  const [timeout, settimeout] = useState(null); // seconds
  const [lastAction, setlastAction] = useState(null);
  const [j2, setj2] = useState(null);
  const [reload, setreload] = useState(false);
  const currTime = (Date.now() / 1000).toFixed();
  const [txn, settxn] = useState(null);
  const [isLoading, setisLoading] = useState(false);

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
      localStorage.clear();
    } catch (err) {
      console.error("Error p1TimeOut", err);
    } finally {
      setisLoading(false);
    }
  };

  // TODO:
  const settleGame = async () => {
    setisLoading(true);
    try {
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const txn = await contractWithSigner.j2Timeout();
      settxn(txn);
      localStorage.clear();
    } catch (err) {
      console.error("Error p1TimeOut", err);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

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
            <button className="btn btn-primary" onClick={settleGame}>
              Settle Game
            </button>
            <Timer
              deadline={parseInt(lastAction) + parseInt(timeout)}
              reloadPage={reloadPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveGame;
