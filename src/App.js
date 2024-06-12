import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CreateGame from "./create-game";
import SolveGame from "./solve";
import JoinGame from "./join-game";
import { RPSAbi } from "./contractAbi";

function App() {
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState("");
  const [contract, setContract] = useState(null);
  const [tabIndex, settabIndex] = useState(0);
  const [userAddress, setuserAddress] = useState(null);

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setProvider(provider);
        const userAddress = await signer.getAddress();
        setuserAddress(userAddress);
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    const readLocalStorage = async () => {
      const rpsAddress = localStorage.getItem("RPSAddress");
      const p1Address = localStorage.getItem("p1Address");
      if (
        rpsAddress &&
        ethers.utils.isAddress(rpsAddress) &&
        userAddress === p1Address
      ) {
        const ctr = new ethers.Contract(rpsAddress, RPSAbi, provider);
        setContract(ctr);
      }
    };

    readLocalStorage();
  }, [provider, userAddress]);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    getNetwork();
  }, [provider]);

  // if (isLoading) {
  //   return (
  //     <span className="loading flex loading-ring max-w-lg mx-auto h-screen loading-lg"></span>
  //   );
  // }
  if (provider === null) {
    return <div className="mx-auto max-w-lg">No Provider Found</div>;
  }

  if (network !== "sepolia") {
    return <div className="mx-auto max-w-lg">Sepolia Network required</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="navbar bg-base-200">
        <div className="flex-1 mx-2">
          <div className="text-xl font-semibold">RPS Game</div>
        </div>
        <div className="flex-none">
          <div>Network: </div>
          <div className="font-semibold px-2">{network.toUpperCase()}</div>
        </div>
      </div>
      <div className="text-sm my-2 flex justify-between text-gray-500">
        <p>User Address</p>
        <p className="font-semibold">{userAddress}</p>
      </div>
      <div role="tablist" className="tabs tabs-boxed rounded-none">
        <button
          onClick={() => settabIndex(0)}
          role="tab"
          className={`tab ${tabIndex === 0 ? "tab-active" : ""}`}
        >
          Your Game
        </button>
        <button
          onClick={() => settabIndex(1)}
          role="tab"
          className={`tab ${tabIndex === 1 ? "tab-active" : ""}`}
        >
          Join Game
        </button>
      </div>
      {tabIndex === 0 ? (
        contract === null ? (
          <CreateGame provider={provider} setContract={setContract} />
        ) : (
          <SolveGame provider={provider} contract={contract} />
        )
      ) : (
        <JoinGame provider={provider} />
      )}
    </div>
  );
}

export default App;
