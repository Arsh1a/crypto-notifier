/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, FormEvent } from "react";
import notificationSfx from "../sounds/notification.mp3";
import { useApiRequest, playSound } from "../utils";
import Navbar from "./Navbar";
import Cryptos from "./Cryptos";
import Footer from "./Footer";

const thresholdForCount = 1.004;

const selectedCurrencies1 =
  "BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN,ZIL,ZRX,ZEC,YFI,XMR,XVS,XTZ";
const selectedCurrencies2 =
  "ATA,ALPHA,ALICE,ARPA,AVE,AVA,ARDR,ANRR,BAL,BZRX,BEL,BADGER,BTT,BEAN,BCH,COMP,CRV,COS,CAKE,DEGO,DGB,DOT,ETH,EOS,ETC,FTT,HIVE,INJ,JST,KSM,LRC,LINK,NBS,LIT,MFT,MKR,MDT,ONT,ORN,PERF,PNT,RUNE,REEF,REN,ROSE,SC,STMX,SKL,SAND,SNX,STX,SRM,TRB,TROY,TRU,TORN,THETA,TCT,POLS,TRX,TKO,UNO,ATM,AUTO,AKRO,ARB";
const selectedCurrencies3 =
  "ALGO,BAR,BAND,BNB,BLZ,DODO,DIA,FIS,FIRO,GXS,GRT,IOTA,JUV,KEY,KNC,KLAY,LUNA,LSK,NULS,NU,NEO,OCEN,OGN,OMG,PSG,POND,PHA,PERP,PERL,PAX,RIF,RSR,SFP,SXP,SUN,STORJ,TLM,UNFI,UTK,VET,WTC,WAN,WRX,WNXM,WIN,XRP,XLM,XEM,LTC,DAI,AAVE,ADA,FTM,MATIC,AXS,MANA,AVAX,GMT,BAT,GRAPH,APT,ENS,SSV,SNT,ENJ,API3,APE";
const selectedCurrencies4 =
  "IMX,BLUR,TON,GMX,CHZ,DAO,DYDX,RDNT,WBTC,CELR,CVC,FIL,FLOW,CVX,QNT,EGALA,GLM,LPT,LDO,MAGIC,NMR,NEAR,1INCH,UNI,S,POL,EGALA,FLR,PMN,T,WLD,BICO,WOO,FET,NOT,ETHFI,AGLD,AEVO,W,MEME,UMA,ZRO,DOGS,G,ONDO,CATI,HMSTR,EIGEN,PAXG,XAUT,ENA,PENDLE,X,JASMY,ANKR,CAKE,BNX,HOT,EDU,SAFE,BANANA,MAJOR,MOVE";
const selectedCurrencies5 =
  "STRK,METIS,TURBO,CGPT,COOKIE,DEXE,ATH,NEIRO,MORPHO,FORM,RENDER";
function Main() {
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [soundActive, setSoundActive] = useState<boolean>(false);
  const [exchangeResults, setExchangeResults] = useState<any[]>([]);
  const [calculateAfter] = useState<number>(5);
  const [alertAtMinimum, setAlertAtMinimum] = useState<number>(1.05);
  const [tempAlertAtMinimum, setTempAlertAtMinimum] = useState<number>(1.05);
  const [showDeals, setShowDeals] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  const { data, error, isLoaded } = useApiRequest(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies1}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies2}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies3}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies4}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies5}&tsyms=USD`
  );
  const audioRef = useRef() as React.MutableRefObject<HTMLAudioElement>;

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
  }, [data]);

  //Init currencies
  useEffect(() => {
    const currencyList = exchangeRates[0];
    if (currencyList && currencies.length === 0) {
      setCurrencies(Object.keys(currencyList).sort());
    }
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
  }, [exchangeRates]);

  //Checks if there is a good investment and plays sound
  useEffect(() => {
    if (exchangeResults.length > 0) {
      //Plays sound if one of favorites goes beyond alertAtMinimum
      if (showFavorites) {
        const filtered = Object.entries(exchangeResults[0]).filter(
          ([key, value]: any) => value >= alertAtMinimum
        );
        const result = Object.fromEntries(filtered);
        if (Object.keys(result).some((el: any) => favorites.includes(el))) {
          if (soundActive) {
            playSound(audioRef);
          }
        }
      } else {
        //Plays sound if showFavorite not active and any currency goes beyond alertAtMinimum
        if (
          Object.values(exchangeResults[0]).some(
            (el: any) => el >= alertAtMinimum
          )
        ) {
          if (soundActive) {
            playSound(audioRef);
          }
        }
      }
    }
  }, [exchangeResults]);

  //Show only good deals
  useEffect(() => {
    if (showDeals) {
      if (exchangeResults.length > 0) {
        if (showFavorites) {
          //Show good deals for favorites
          const filtered = Object.entries(exchangeResults[0]).filter(
            ([key, value]: any) => value >= alertAtMinimum
          );
          const result = Object.fromEntries(filtered);
          const resultArray = Object.keys(result);
          setOnlyDeals(resultArray.filter((item) => favorites.includes(item)));
        }
        //Show good deals for all currencies
        else {
          const filtered = Object.entries(exchangeResults[0]).filter(
            ([key, value]: any) => value >= alertAtMinimum
          );
          const result = Object.fromEntries(filtered);
          const resultArray = Object.keys(result);
          setOnlyDeals(resultArray);
        }
      }
    }
  }, [showDeals, showFavorites, exchangeResults, alertAtMinimum]);

  useEffect(() => {
    if (exchangeResults.length > 0) {
      const currentResults = exchangeResults[0];

      setCounts((prevCounts) => {
        // Clone previous counts to update
        const newCounts = { ...prevCounts };

        Object.entries(currentResults).forEach(([currency, value]) => {
          const numericValue = Number(value);
          if (!isNaN(numericValue) && numericValue >= thresholdForCount) {
            newCounts[currency] = (newCounts[currency] || 0) + 1;
          }
        });

        return newCounts;
      });
    }
  }, [exchangeResults]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts({});
    }, 900000); // 900000 ms = 15 minutes

    return () => clearInterval(interval);
  }, []);

  //Get favorites from localstorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  //Set favorites to localstorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const calculateResult = (currency: string) => {
    if (exchangeRates.length === calculateAfter) {
      return (
        exchangeRates[exchangeRates.length - 1][currency].USD /
        exchangeRates[0][currency].USD
      );
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAlertAtMinimum(tempAlertAtMinimum);
  };

  const handleAppState = () => {
    if (!showDeals && !showFavorites) {
      return currencies;
    }
    if (showDeals && showFavorites) {
      return onlyDeals;
    }
    if (!showDeals && showFavorites) {
      return favorites;
    }
    if (showDeals && !showFavorites) {
      return onlyDeals;
    }
    return currencies;
  };

  if (error) return <div>Failed to load</div>;
  if (!isLoaded) return <div className="loading">Loading</div>;
  return (
    <>
      <audio ref={audioRef}>
        <source src={notificationSfx} type="audio/mp3" />
      </audio>
      <Navbar
        {...{
          setSoundActive,
          soundActive,
          audioRef,
          handleSubmit,
          tempAlertAtMinimum,
          setTempAlertAtMinimum,
          setShowDeals,
          showDeals,
          setShowFavorites,
          showFavorites,
        }}
      />
      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <h3>Crypto Counts (≥ {thresholdForCount}):</h3>
        {Object.keys(counts).length === 0 && <p>No counts yet.</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {Object.entries(counts)
            .filter(([currency, count]) =>
              showFavorites ? favorites.includes(currency) : true
            )
            .map(([currency, count]) => (
              <div key={currency}>
                <strong>{currency}:</strong> {count}
              </div>
            ))}
        </div>
      </div>
      <Cryptos
        {...{
          currencies,
          exchangeRates,
          calculateAfter,
          exchangeResults,
          alertAtMinimum,
          calculateResult,
          favorites,
          setFavorites,
        }}
        data={handleAppState()}
      />
      <Footer />
    </>
  );
}

export default Main;
