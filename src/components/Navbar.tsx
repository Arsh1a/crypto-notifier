import type { Dispatch, FormEventHandler, RefObject, SetStateAction } from "react";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { playSound } from "../lib/playSound";
import { useViewTransition } from "../lib/useViewTransition";

interface Props {
  setSoundActive: Dispatch<SetStateAction<boolean>>;
  soundActive: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  tempAlertAtMinimum: string;
  setTempAlertAtMinimum: Dispatch<SetStateAction<string>>;
  showDeals: boolean;
  setShowDeals: Dispatch<SetStateAction<boolean>>;
  showFavorites: boolean;
  setShowFavorites: Dispatch<SetStateAction<boolean>>;
}

const BUTTON =
  "cursor-pointer rounded-[20px] bg-brand p-4 text-paper transition-opacity duration-300 hover:opacity-50";

function Navbar({
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
}: Props) {
  const startTransition = useViewTransition();

  return (
    <div className="mb-15 flex flex-col justify-between nav:flex-row">
      <div className="flex flex-wrap items-center gap-10">
        <div
          className="cursor-pointer text-[34px] leading-none transition-opacity duration-300 hover:opacity-50"
          onClick={() => {
            setSoundActive(!soundActive);
            // Also the gesture that unlocks autoplay for later alerts.
            if (!soundActive) playSound(audioRef);
          }}
        >
          {soundActive ? <MdVolumeUp /> : <MdVolumeOff />}
        </div>

        <button onClick={() => startTransition(() => setShowDeals((prev) => !prev))} className={BUTTON}>
          {showDeals ? <>Show all</> : <>Show only greens</>}
        </button>

        <button
          onClick={() => startTransition(() => setShowFavorites((prev) => !prev))}
          className={BUTTON}
        >
          {showFavorites ? <>Show all</> : <>Show only favorites</>}
        </button>
      </div>

      <div className="mt-7.5 nav:mt-0">
        <div className="flex items-center">
          Alert at:
          <form onSubmit={handleSubmit} className="relative ml-5 flex items-center">
            <input
              required
              type="number"
              step="any"
              value={tempAlertAtMinimum}
              onChange={(e) => setTempAlertAtMinimum(e.target.value)}
              className="card-sheen rounded-[15px] p-3 pr-20 text-paper"
            />
            <input
              type="submit"
              value="Apply"
              className="absolute right-2.5 cursor-pointer bg-transparent text-paper transition-opacity duration-300 hover:opacity-50"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
