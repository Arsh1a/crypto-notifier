import React, { useEffect, useState, useRef } from "react";
import { useApiRequest } from "../util/useApiRequest";
import notificationSfx from "../sounds/notification.mp3";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";

function Main() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const selectedCurrencies = useState(
    "BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN"
  );
  const { data, error, isLoaded } = useApiRequest(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies}&tsyms=USD`
  );
  const audioRef = useRef();
  const [soundActive, setSoundActive] = useState(false);
  const [exchangeResults, setExchangeResults] = useState([]);
  const [calculateAfter, setCalculateAfter] = useState(30);
  const [alertAtMinimum, setAlertAtMinimum] = useState(1.05);
  const [tempAlertAtMinimum, setTempAlertAtMinimum] = useState(1.05);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  //Init
  useEffect(() => {
    if (data.length !== 0) {
      if (exchangeRates.length === calculateAfter) {
        setExchangeRates(exchangeRates.slice(1));
        setExchangeRates((oldArray) => [...oldArray, data]);
      } else {
        setExchangeRates((oldArray) => [...oldArray, data]);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  //Init currencies
  useEffect(() => {
    const currencyList = exchangeRates[0];
    if (currencyList && currencies.length === 0) {
      setCurrencies(Object.keys(currencyList));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRates]);

  //Init exchange results
  useEffect(() => {
    if (currencies) {
      const initExchangeResults = currencies.reduce(
        (acc, cur) => ({ ...acc, [cur]: calculateResult(cur) }),
        {}
      );
      setExchangeResults([initExchangeResults]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRates]);

  //Checks if there is a good investment and plays sound
  useEffect(() => {
    if (exchangeResults.length > 0) {
      if (Object.values(exchangeResults[0]).some((el) => el >= alertAtMinimum)) {
        if (soundActive) {
          playSound();
        }
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeResults]);

  const calculateResult = (currency) => {
    if (exchangeRates.length === calculateAfter) {
      return exchangeRates[exchangeRates.length - 1][currency].USD / exchangeRates[0][currency].USD;
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setAlertAtMinimum(tempAlertAtMinimum);
  };

  if (error) return <div>Failed to load</div>;
  if (!isLoaded) return <div>Loading...</div>;
  return (
    <>
      <audio ref={audioRef}>
        <source src={notificationSfx} type="audio/mp3" />
      </audio>
      <div className="navbar">
        <div
          className="sound"
          onClick={() => {
            setSoundActive(!soundActive);
            !soundActive && playSound();
          }}
        >
          {soundActive ? <MdVolumeUp /> : <MdVolumeOff />}
        </div>
        <div className="alert-at">
          Alert at:
          <form onSubmit={handleSubmit}>
            <input
              required
              type="number"
              value={tempAlertAtMinimum}
              onChange={(e) => setTempAlertAtMinimum(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>
        </div>
      </div>
      <div className="crypto-container">
        {currencies.map((currency, index) => (
          <div className="crypto" key={index}>
            <h1>{currency}</h1>
            <div className="rates">
              {exchangeRates[0][currency].USD}$
              {exchangeRates.length === calculateAfter && (
                <>→{exchangeRates[exchangeRates.length - 1][currency].USD}$</>
              )}
            </div>
            {
              <p
                className={
                  exchangeResults[0][currency] >= alertAtMinimum ? "going-up" : "going-down"
                }
              >
                result :{calculateResult(currency)}
              </p>
            }
          </div>
        ))}
      </div>
    </>
  );
}

export default Main;
