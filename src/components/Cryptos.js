import React from "react";

function Cryptos({
  currencies,
  exchangeRates,
  calculateAfter,
  exchangeResults,
  alertAtMinimum,
  calculateResult,
  onlyDeals,
  showOnly,
  data,
}) {
  if (data.length === 0) return <h1>Empty</h1>;
  return (
    <>
      {exchangeRates.length !== calculateAfter && (
        <div className="loading-results">
          It takes {(20 * calculateAfter) / 60} minutes to calculate results...
        </div>
      )}
      <div className="crypto-container">
        {data.map((currency, index) => (
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
