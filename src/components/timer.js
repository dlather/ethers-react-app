import React from "react";

function Timer({ deadline, reloadPage }) {
  const now = (Date.now() / 1000).toFixed();
  let [time, setTime] = React.useState(now);

  function updateTime() {
    const newTime = (Date.now() / 1000).toFixed();
    setTime(newTime);
    if (deadline - parseInt(time) < 0) {
      reloadPage();
    }
  }

  React.useEffect(() => {
    console.log(`initializing interval`);
    const interval = setInterval(() => {
      updateTime();
    }, 1000);

    return () => {
      console.log(`clearing interval`);
      clearInterval(interval);
    };
  }, []);

  return <kbd className="kbd kbd-md">{deadline - parseInt(time)} sec</kbd>;
}

export default Timer;
