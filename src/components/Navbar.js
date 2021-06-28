import React from "react";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";
import { playSound } from "../utils";

function Navbar({
  setSoundActive,
  soundActive,
  audioRef,
  handleSubmit,
  tempAlertAtMinimum,
  setTempAlertAtMinimum,
  setShowOnly,
  showOnly,
}) {
  return (
    <div className="navbar">
      <div className="left-navbar">
        <div
          className="sound"
          onClick={() => {
            setSoundActive(!soundActive);
            !soundActive && playSound(audioRef);
          }}
        >
          {soundActive ? <MdVolumeUp /> : <MdVolumeOff />}
        </div>
        <button onClick={() => setShowOnly(!showOnly)}>
          {showOnly ? <>Show all</> : <>Show only green</>}
        </button>
      </div>
      <div className="right-navbar">
        <div className="alert-at">
          Alert at:
          <form onSubmit={handleSubmit}>
            <input
              required
              type="number"
              value={tempAlertAtMinimum}
              onChange={(e) => setTempAlertAtMinimum(e.target.value)}
            />
            <input type="submit" value="Apply" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
