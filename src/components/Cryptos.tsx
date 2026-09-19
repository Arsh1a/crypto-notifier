import type { Dispatch, SetStateAction } from "react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import type { Rates } from "../hooks/useApiRequest";
import { CALCULATE_AFTER, POLL_MS } from "../constants";

interface Props {
  exchangeRates: Rates[];
  calculateResult: (currency: string) => number | undefined;
  data: string[];
  favorites: string[];
  setFavorites: Dispatch<SetStateAction<string[]>>;
}

/** The original's card tints: yellow, then blue, then red as the ratio climbs. */
function calculateCardColor(result: number | undefined): string | undefined {
  if (result === undefined) return undefined;
  if (result > 1 && result <= 1.002) {
    return "linear-gradient(90deg, rgba(205,171,0,1) 0%, rgba(231,209,66,1) 100%)";
  }
  if (result >= 1.002 && result <= 1.004) {
    return "linear-gradient(90deg, rgba(0,7,126,1) 0%, rgba(30,36,156,1) 100%)";
  }
  if (result >= 1.004) {
    return "linear-gradient(90deg, rgba(116,15,15,1) 0%, rgba(183,25,25,1) 100%)";
  }
  return undefined;
}

function Cryptos({ exchangeRates, calculateResult, data, favorites, setFavorites }: Props) {
  const handleFavorites = (currency: string) => {
    setFavorites((prev) =>
      prev.includes(currency) ? prev.filter((item) => item !== currency) : [...prev, currency],
    );
  };

  const windowFull = exchangeRates.length === CALCULATE_AFTER;
  const newest = exchangeRates[exchangeRates.length - 1];
  const oldest = exchangeRates[0];

  if (data.length === 0) return <h1 className="text-[2em] font-medium">Empty</h1>;

  return (
    <>
      {!windowFull && (
        <div className="dots-after pb-12.5 text-center text-xl opacity-50">
          It takes {Math.ceil((POLL_MS / 1000) * CALCULATE_AFTER / 60)} minutes to calculate results
        </div>
      )}

      <div className="grid grid-cols-1 gap-7.5 c2:grid-cols-2 c3:grid-cols-3 c4:grid-cols-4 c5:grid-cols-5">
        {data.map((currency) => {
          const result = calculateResult(currency);
          const background = calculateCardColor(result);
          const from = oldest?.[currency]?.USD;
          const to = newest?.[currency]?.USD;

          return (
            <div
              className={`rounded-[10px] p-5 transition-[background,transform] duration-300 ${
                background ? "" : "card-sheen"
              }`}
              key={currency}
              style={{ background, viewTransitionName: `crypto-${currency}` }}
            >
              <h1 className="text-[2em] font-medium">{currency}</h1>

              <div className="my-2.5 flex">
                {from ?? "—"}$
                {windowFull && to !== undefined && <>→{to}$</>}
              </div>

              <p>result :{result ?? ""}</p>

              <div className="mt-2.5 flex items-center justify-end gap-5">
                <a
                  href={`https://www.binance.com/en/trade/${currency}_USDT`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    title={`Trade ${currency} in Binance`}
                    src="/binance-icon.svg"
                    height="25"
                    width="25"
                    alt="Binance"
                    className="transition-opacity duration-300 hover:opacity-50"
                  />
                </a>
                <span
                  className="cursor-pointer text-[32px] leading-none text-heart transition-opacity duration-300 hover:opacity-50"
                  title="Favorite"
                  onClick={() => handleFavorites(currency)}
                >
                  {favorites.includes(currency) ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Cryptos;
