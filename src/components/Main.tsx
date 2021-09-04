import React, { useEffect, useState, useRef, FormEvent } from "react";
import notificationSfx from "../sounds/notification.mp3";
import { useApiRequest, playSound } from "../utils";
import Navbar from "./Navbar";
import Cryptos from "./Cryptos";
import Footer from "./Footer";

const selectedCurrencies1 =
  "BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN,ZIL,ZRX,ZEC,YFI,XMR,XVS,XTZ";
const selectedCurrencies2 =
  "ATA,ALPHA,ALICE,ARPA,AVE,AVA,ARDR,ANRR,BAL,BZRX,BEL,BADGER,BTT,BEAN,BCH,COMP,CRV,COS,CAKE,DEGO,DGB,DOT,ETH,EOS,ETC,FTT,HIVE,INJ,JST,KSM,LRC,LINK,NBS,LIT,MFT,MKR,MDT,ONT,ORN,PERF,PNT,RUNE,REEF,REN,ROSE,SC,STMX,SKL,SAND,SNX,STX,SRM,TRB,TROY,TRU,TORN,THETA,TCT,POLS,TRX,TKO,UNO,ATM,ASR,ACM,AUTO,AKRO";
const selectedCurrencies3 =
  "ALGO,BAR,BAND,BNB,BLZ,DODO,DIA,FIS,FIRO,GXS,GRT,IOTA,JUV,KEY,KNC,KLAY,LUNA,LSK,NULS,NU,NMR,NEO,OCEN,OGN,OMG,PSG,POND,PHA,PERP,PERL,PAX,RIF,RSR,SFP,SXP,SUN,STORJ,TLM,UNFI,UTK,VET,WTC,WAN,WRX,WNXM,WIN,XRP,XLM,XEM";

function Main() {
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [soundActive, setSoundActive] = useState<boolean>(false);
  const [exchangeResults, setExchangeResults] = useState<any[]>([]);
  const [calculateAfter] = useState<number>(9);
  const [alertAtMinimum, setAlertAtMinimum] = useState<number>(1.05);
  const [tempAlertAtMinimum, setTempAlertAtMinimum] = useState<number>(1.05);
  const [showOnly, setShowOnly] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<string[]>([]);
  const { data, error, isLoaded } = useApiRequest(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies1}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies2}&tsyms=USD`,
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCurrencies3}&tsyms=USD`
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  //Init currencies
  useEffect(() => {
    const currencyList = exchangeRates[0];
    if (currencyList && currencies.length === 0) {
      setCurrencies(Object.keys(currencyList).sort());
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
      if (Object.values(exchangeResults[0]).some((el: any) => el >= alertAtMinimum)) {
        if (soundActive) {
          playSound(audioRef);
        }
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeResults]);

  //Show only good deals
  useEffect(() => {
    if (showOnly) {
      if (exchangeResults.length > 0) {
        const filtered = Object.entries(exchangeResults[0]).filter(
          (value: any) => value >= alertAtMinimum
        );
        const result = Object.fromEntries(filtered);
        const resultArray = Object.keys(result);
        setOnlyDeals(resultArray);
      }
    }
  }, [showOnly, exchangeResults, alertAtMinimum]);

  const calculateResult = (currency: string) => {
    if (exchangeRates.length === calculateAfter) {
      return exchangeRates[exchangeRates.length - 1][currency].USD / exchangeRates[0][currency].USD;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAlertAtMinimum(tempAlertAtMinimum);
  };

  if (error) return <div>Failed to load</div>;
  if (!isLoaded) return <div className="loading">Loading...</div>;
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
          setShowOnly,
          showOnly,
        }}
      />
      <Cryptos
        {...{
          exchangeRates,
          calculateAfter,
          exchangeResults,
          alertAtMinimum,
          calculateResult,
        }}
        data={showOnly ? onlyDeals : currencies}
      />
      <Footer />
    </>
  );
}

export default Main;
