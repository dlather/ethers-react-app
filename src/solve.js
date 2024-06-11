import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const SolveGame = ({ provider, setisLoading, contract }) => {
  const [c2Move, setc2Move] = useState(null);
  const [timeout, settimeout] = useState(null);

  const fetchData = async () => {
    if (contract) {
      try {
        const c2 = await contract.c2();
        console.log(c2);
        setc2Move(c2);
        const timeout = await contract.TIMEOUT();
        console.log(timeout);
        settimeout(timeout);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract]);

  return <div>Okay</div>;
};

export default SolveGame;
