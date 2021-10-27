import React from "react";

interface Props {
  exchangeRates: any[];
  calculateAfter: number;
  exchangeResults: string[];
  alertAtMinimum: number;
  calculateResult: Function;
  data: string[];
}

function Cryptos({
  exchangeRates,
  calculateAfter,
  exchangeResults,
  alertAtMinimum,
  calculateResult,
  data,
}: Props) {
  if (data.length === 0) return <h1>Empty</h1>;
  return (
    <>
      {exchangeRates.length !== calculateAfter && (
        <div className="loading loading-results">
          It takes {(20 * calculateAfter) / 60} minutes to calculate results
        </div>
      )}
      <div className="crypto-container">
        {data.map((currency: any, index) => (
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
                  Number(exchangeResults[0][currency]) >= alertAtMinimum ? "going-up" : "going-down"
                }
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
                  height="30"
                  width="30"
                  alt="Binance"
                />
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Cryptos;
