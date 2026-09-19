import { IoLogoGithub } from "react-icons/io";

function Footer() {
  return (
    <footer className="flex justify-center pt-15 text-2xl">
      <a
        href="https://github.com/Arsh1a/crypto-notifier"
        target="_blank"
        rel="noreferrer"
        aria-label="Source on GitHub"
        className="cursor-pointer transition-opacity duration-300 hover:opacity-50"
      >
        <IoLogoGithub />
      </a>
    </footer>
  );
}

export default Footer;
