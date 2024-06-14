import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RPSAbi } from "./contractAbi";
import { moves, sanitizeInput } from "./utils";
import Timer from "./components/timer";

const JoinGame = ({ provider }) => {
  const [gameAddress, setgameAddress] = useState("");
  const [selectedMove, setselectedMove] = useState(null);
  const [txn, settxn] = useState(null);
  const [contract, setcontract] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [validGame, setvalidGame] = useState(false);
  const [reload, setreload] = useState(false);
  const [c2Move, setc2Move] = useState(null);
  const [timeout, settimeout] = useState(null); // seconds
  const [lastAction, setlastAction] = useState(null);
  const [j2, setj2] = useState(null);
  const [j1, setj1] = useState(null);
  const currTime = (Date.now() / 1000).toFixed();
  const [stake, setstake] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (ethers.utils.isAddress(gameAddress)) {
        setisLoading(true);
        try {
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();
          const contract = new ethers.Contract(gameAddress, RPSAbi, provider);
          const p2 = await contract.j2();
          if (p2 === userAddress) {
            const c2 = await contract.c2();
            const timeout = await contract.TIMEOUT();
            const lastAct = await contract.lastAction();
            const p1 = await contract.j1();
            const stk = await contract.stake();
            setcontract(contract);
            setstake(ethers.BigNumber.from(stk._hex).toNumber());
            setj2(p2);
            setj1(p1);
            settimeout(ethers.BigNumber.from(timeout._hex).toNumber());
            setc2Move(c2);
            setlastAction(ethers.BigNumber.from(lastAct._hex).toNumber());
            setvalidGame(true);
          } else {
            console.log("Not Valid User");
          }
        } catch (err) {
          console.log(err);
        } finally {
          setisLoading(false);
        }
      } else {
        setvalidGame(false);
      }
    };
    fetchGameDetails();
  }, [gameAddress, provider, reload]);

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
        reloadPage();
      }
    }
  };
  const reloadPage = () => {
    setreload(!reload);
  };
  const p2TimeOut = async () => {
    setisLoading(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(gameAddress, RPSAbi, provider);
      const contractWithSigner = contract.connect(signer);
      const txn = await contractWithSigner.j1Timeout();
      settxn(txn);
      await txn.wait();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      console.error("Error p1TimeOut", err);
    } finally {
      setisLoading(false);
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
      <div className="my-4">
        <label className="input input-bordered flex items-center w-72">
          <input
            type="text"
            value={gameAddress}
            onChange={(e) => {
              if (sanitizeInput(e.target.value)) {
                setgameAddress(e.target.value);
              }
            }}
            className="grow"
            placeholder="Enter Game Address"
          />
          {/* <kbd className="kbd kbd-sm">addr</kbd> */}
        </label>
        <div className="label">
          {gameAddress !== null &&
          gameAddress !== "" &&
          !ethers.utils.isAddress(gameAddress) ? (
            <span className="label-text-alt text-red-600">Invalid Address</span>
          ) : null}
        </div>
      </div>
      {validGame ? (
        c2Move !== 0 ? (
          <div className="justify-center items-center flex flex-col">
            {parseInt(lastAction) + parseInt(timeout) < parseInt(currTime) ? (
              <div className="flex justify-between items-center w-full">
                <p className="text-lg font-semibold">Player 1 Timed out</p>
                {stake > 0 && (
                  <button className="btn btn-primary" onClick={p2TimeOut}>
                    Get Stake Back
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center w-full">
                <p className="text-lg font-semibold">Waiting for Player 1</p>
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
                    <th>Player 1 Address</th>
                    <td>{j1}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col mx-auto items-center justify-center">
            <div className="flex justify-between items-center w-full">
              {parseInt(lastAction) + parseInt(timeout) > currTime ? (
                <p className="text-lg font-semibold">Your Turn</p>
              ) : (
                <p className="text-lg font-semibold">Your Turn is Over</p>
              )}
              {/* <button className="btn btn-primary" onClick={p2TimeOut}>
                Get Stake Back
              </button> */}
              {parseInt(lastAction) + parseInt(timeout) > currTime ? (
                <p>{stake} wei</p>
              ) : null}
              {parseInt(lastAction) + parseInt(timeout) > currTime ? (
                <Timer
                  deadline={parseInt(lastAction) + parseInt(timeout)}
                  reloadPage={reloadPage}
                />
              ) : null}
            </div>
            {parseInt(lastAction) + parseInt(timeout) > currTime ? (
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
            ) : null}
            {parseInt(lastAction) + parseInt(timeout) > currTime ? (
              <div className="my-2">
                <button
                  onClick={playMove}
                  className={`btn btn-primary flex items-center w-72 `}
                  disabled={`${selectedMove !== null && ethers.utils.isAddress(gameAddress) ? "" : "disabled"}`}
                >
                  Play
                </button>
              </div>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
};

export default JoinGame;
