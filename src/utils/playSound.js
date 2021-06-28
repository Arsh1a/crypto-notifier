const playSound = (audioRef) => {
  if (audioRef.current) {
    audioRef.current.play();
  }
};
export default playSound;
