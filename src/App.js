import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RPSAbi, RPSByteCode } from './contractAbi'
import { generateSalt, setSecureCookie} from './utils'
const acc1 = '0xc9C1754fD6bAF34A2Ed52cF5E25585958Ddc34A1';
const acc2 = '0x40E72ea745f86aceEDB1cbD368Ab2D8D055724d0';

const moves = ["Rock", "Paper", "Scissors", "Spock", "Lizard"]

function App() {
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState('');
  const [contract, setContract] = useState(null);
  const [isLoading, setisLoading] = useState(false)
  const [selectedMove, setselectedMove] = useState(null)

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
      }
    };

    initializeProvider();
  }, []);

  const deployContract = async () => {
    if (provider) {
      setisLoading(true);
      const signer = provider.getSigner();
      const salt = generateSalt(32);
      const ContractFactory = new ethers.ContractFactory(RPSAbi, RPSByteCode, signer);
      const deployedContract = await ContractFactory.deploy(salt, acc2, {
        value: ethers.utils.parseUnits("5", "wei")
    });
      setSecureCookie('salt', salt, 5);
      await deployedContract.deployed();
      setContract(deployedContract);
      console.log(deployedContract.address)
      setisLoading(false);
    }
  };

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    getNetwork();
  }, [provider]);

  return (
    <div>
      <div className="navbar bg-base-200">
  <div className="flex-1 mx-2">
    <div className="text-xl font-semibold">RPS Game
</div>
  </div>
  <div className="flex-none">
    <div>Network: </div>
   <div className='font-semibold px-2'>{network.toUpperCase()}</div>
  </div>
</div>
<div className="flex justify-center gap-4 my-4 w-full">
{moves.map((m,i) => (<kbd onClick={() => setselectedMove(i)} className={`kbd ${selectedMove === i ? 'bg-primary text-white': null}`}>{m}</kbd>))}
</div>
<div className='w-full flex justify-center my-4'>
<label className="input input-bordered flex items-center w-72">
  <input type="number" className="grow" placeholder="Enter Amount" />
  <kbd className="kbd kbd-sm">wei</kbd>
</label>
</div>
<div className='w-full flex justify-center my-4'>
<label className="input input-bordered flex items-center w-72">
  <input type="text" className="grow" placeholder="Player 2 Address" />
  {/* <kbd className="kbd kbd-sm">addr</kbd> */}
</label>
</div>
<div className='w-full flex justify-center my-4'>
<label className="btn btn-primary flex items-center w-72">
  Start Game
</label>
</div>


      {/* {isLoading ? <p>Loading ... </p> : null}
    <h1>Ethers.js and React Integration</h1>
    <p>Connected to network: {network}</p> */}
    {/* Your application code goes here */}
    {/* <button onClick={deployContract} className='btn mt-4'>Deploy</button>
    <button onClick={() => console.log(generateSalt(32))} className='btn mt-4'>Salt</button> */}
  </div>
  );
}

export default App;