import React from "react";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";

interface Props {
  currencies: string[];
  exchangeRates: any[];
  calculateAfter: number;
  exchangeResults: string[];
  alertAtMinimum: number;
  calculateResult: Function;
  data: string[];
  setFavorites: Function;
  favorites: string[];
}

function Cryptos({
  currencies,
  exchangeRates,
  calculateAfter,
  exchangeResults,
  alertAtMinimum,
  calculateResult,
  data,
  setFavorites,
  favorites,
}: Props) {
  const handleFavorites = (currency: string) => {
    if (favorites.includes(currency)) {
      removeFromFavorites(currency);
    }
    if (!favorites.includes(currency)) {
      addToFavorites(currency);
    }
  };

  const addToFavorites = (currency: string) => {
    setFavorites([...favorites, currency]);
  };

  const removeFromFavorites = (currency: string) => {
    setFavorites(favorites.filter((item) => item !== currency));
  };

  const calculateCardColor = (currency: string) => {
    let calculatedCurrency = calculateResult(currency);

    if (calculatedCurrency > 1 && calculatedCurrency <= 1.002) {
      return "linear-gradient(90deg, rgba(205,171,0,1) 0%, rgba(231,209,66,1) 100%)";
    }
    if (calculatedCurrency >= 1.002 && calculatedCurrency <= 1.004) {
      return "linear-gradient(90deg, rgba(0,7,126,1) 0%, rgba(30,36,156,1) 100%)";
    }
    if (calculatedCurrency >= 1.004) {
      return "linear-gradient(90deg, rgba(116,15,15,1) 0%, rgba(183,25,25,1) 100%)";
    }
  };

  if (data.length === 0) return <h1>Empty</h1>;

  return (
    <>
      {exchangeRates.length !== calculateAfter && (
        <div className="loading loading-results">
          It takes {Math.ceil((20 * calculateAfter) / 60)} minutes to calculate results
        </div>
      )}
      <div className="crypto-container">
        {data.map((currency: any, index) => (
          <div className="crypto" style={{ background: calculateCardColor(currency) }} key={index}>
            <h1>{currency}</h1>
            <div className="rates">
              {exchangeRates ? exchangeRates[0][currency].USD : "TEST"}$
              {exchangeRates.length === calculateAfter && (
                <>→{exchangeRates[exchangeRates.length - 1][currency].USD}$</>
              )}
            </div>
            {
              <p
              // className={
              //   Number(exchangeResults[0][currency]) >= alertAtMinimum ? "going-up" : "going-down"
              // }
              >
                result :{calculateResult(currency)}
              </p>
            }
            <div className="crypto-exchange">
              <a
                href={`https://www.binance.com/en/trade/${currency}_USDT`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  title={`Trade ${currency} in Binance`}
                  src="/crypto-notifier/binance-icon.svg"
                  height="25"
                  width="25"
                  alt="Binance"
                />
              </a>
              <span
                className="crypto-favorite"
                title="Favorite"
                onClick={() => handleFavorites(currency)}
              >
                {favorites.includes(currency) ? <IoMdHeart /> : <IoMdHeartEmpty />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Cryptos;
