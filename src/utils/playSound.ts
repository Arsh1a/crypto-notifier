const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement>) => {
  if (audioRef.current) {
    audioRef.current.play();
  }
};
export default playSound;
