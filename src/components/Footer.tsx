import { IoLogoGithub } from "react-icons/io";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 pt-16 pb-4">
      <a
        href="https://github.com/Arsh1a/crypto-notifier"
        target="_blank"
        rel="noreferrer"
        aria-label="Source on GitHub"
        className="text-2xl transition-opacity hover:opacity-50"
      >
        <IoLogoGithub />
      </a>
      <p className="text-xs text-paper/30">
        Prices from public exchange tickers. Informational only — not financial advice.
      </p>
    </footer>
  );
}
