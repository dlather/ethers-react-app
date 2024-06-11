import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CreateGame from "./create-game";
import SolveGame from "./solve";
import { RPSAbi } from "./contractAbi";

function App() {
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    const readLocalStorage = async () => {
      const rpsAddress = localStorage.getItem("RPSAddress");
      console.log(rpsAddress);
      if (rpsAddress && ethers.utils.isAddress(rpsAddress)) {
        const ctr = new ethers.Contract(rpsAddress, RPSAbi, provider);
        setContract(ctr);
      }
    };

    readLocalStorage();
  }, [provider]);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    getNetwork();
  }, [provider]);

  if (isLoading) {
    return (
      <span className="loading flex loading-ring max-w-lg mx-auto h-screen loading-lg"></span>
    );
  }
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
      {contract === null ? (
        <CreateGame setisLoading={setisLoading} provider={provider} />
      ) : (
        <SolveGame
          provider={provider}
          setisLoading={setisLoading}
          contract={contract}
        />
      )}
    </div>
  );
}

export default App;
