import { useEffect, useState, type FormEvent } from "react";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { IoMdNotifications, IoMdNotificationsOff, IoMdSettings } from "react-icons/io";

interface Props {
  sound: boolean;
  notifications: boolean;
  onlyMovers: boolean;
  onlyFavorites: boolean;
  alertPercent: number;
  query: string;
  settingsOpen: boolean;
  onToggleSound: () => void;
  onToggleNotifications: () => void;
  onToggleMovers: () => void;
  onToggleFavorites: () => void;
  onAlertPercent: (value: number) => void;
  onQuery: (value: string) => void;
  onToggleSettings: () => void;
}

const PILL =
  "cursor-pointer rounded-[20px] px-4 py-3 text-sm font-medium transition-opacity hover:opacity-50";

function GlyphButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`cursor-pointer text-[30px] leading-none transition-opacity hover:opacity-50 ${
        active ? "text-brand" : "text-paper/70"
      }`}
    >
      {children}
    </button>
  );
}

export function Navbar({
  sound,
  notifications,
  onlyMovers,
  onlyFavorites,
  alertPercent,
  query,
  settingsOpen,
  onToggleSound,
  onToggleNotifications,
  onToggleMovers,
  onToggleFavorites,
  onAlertPercent,
  onQuery,
  onToggleSettings,
}: Props) {
  const [draft, setDraft] = useState(String(alertPercent));

  // Keep the field honest if the value changes from the settings panel.
  useEffect(() => setDraft(String(alertPercent)), [alertPercent]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = Number(draft);
    if (Number.isFinite(next) && next > 0) onAlertPercent(next);
    else setDraft(String(alertPercent));
  };

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <GlyphButton active={sound} label={sound ? "Mute alerts" : "Enable alert sound"} onClick={onToggleSound}>
          {sound ? <MdVolumeUp /> : <MdVolumeOff />}
        </GlyphButton>
        <GlyphButton
          active={notifications}
          label={notifications ? "Disable desktop notifications" : "Enable desktop notifications"}
          onClick={onToggleNotifications}
        >
          {notifications ? <IoMdNotifications /> : <IoMdNotificationsOff />}
        </GlyphButton>

        <button
          type="button"
          onClick={onToggleMovers}
          aria-pressed={onlyMovers}
          className={`${PILL} ${onlyMovers ? "bg-paper text-bg" : "bg-brand text-bg"}`}
        >
          {onlyMovers ? "Show all" : "Show only greens"}
        </button>
        <button
          type="button"
          onClick={onToggleFavorites}
          aria-pressed={onlyFavorites}
          className={`${PILL} ${onlyFavorites ? "bg-paper text-bg" : "bg-brand text-bg"}`}
        >
          {onlyFavorites ? "Show all" : "Show only favorites"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search"
          spellCheck={false}
          autoComplete="off"
          aria-label="Search symbols"
          className="card-sheen w-36 rounded-[15px] px-4 py-3 text-sm outline-none placeholder:text-paper/35 focus:ring-1 focus:ring-brand/60"
        />

        <div className="flex items-center gap-3 text-sm">
          <span className="whitespace-nowrap">Alert at %:</span>
          <form onSubmit={submit} className="relative flex items-center">
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Alert threshold in percent"
              className="card-sheen tnum w-32 rounded-[15px] py-3 pr-16 pl-4 text-sm outline-none focus:ring-1 focus:ring-brand/60"
            />
            <input
              type="submit"
              value="Apply"
              className="absolute right-3 cursor-pointer bg-transparent text-sm text-brand transition-opacity hover:opacity-50"
            />
          </form>
        </div>

        <GlyphButton active={settingsOpen} label="Settings" onClick={onToggleSettings}>
          <IoMdSettings />
        </GlyphButton>
      </div>
    </div>
  );
}
