import type { Settings } from "../types";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onResetCounts: () => void;
}

interface FieldProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}

function NumberField({ label, hint, value, min, max, step, suffix, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm">{label}</span>
      <span className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            // Ignore half-typed input; clamp so the poll loop can't get a 0.
            if (Number.isFinite(next) && next >= min && next <= max) onChange(next);
          }}
          className="tnum w-full rounded-[15px] bg-bg/60 py-3 pr-12 pl-4 text-sm outline-none focus:ring-1 focus:ring-brand/60"
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-paper/35">
          {suffix}
        </span>
      </span>
      <span className="text-xs text-paper/35">{hint}</span>
    </label>
  );
}

export function SettingsPanel({ settings, onChange, onResetCounts }: Props) {
  const lookback = (settings.windowSize - 1) * settings.pollSeconds;

  return (
    <div className="card-sheen animate-fade-in mb-10 rounded-[10px] p-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Refresh interval"
          hint="How often prices are pulled."
          value={settings.pollSeconds}
          min={5}
          max={300}
          step={5}
          suffix="s"
          onChange={(pollSeconds) => onChange({ pollSeconds })}
        />
        <NumberField
          label="Window size"
          hint={`Compares now against ${lookback}s ago.`}
          value={settings.windowSize}
          min={2}
          max={30}
          step={1}
          suffix="ticks"
          onChange={(windowSize) => onChange({ windowSize })}
        />
        <NumberField
          label="Alert threshold"
          hint="Move over the window that fires the alarm."
          value={settings.alertPercent}
          min={0.1}
          max={100}
          step={0.1}
          suffix="%"
          onChange={(alertPercent) => onChange({ alertPercent })}
        />
        <NumberField
          label="Count threshold"
          hint="Smaller move that tints the card and bumps its counter."
          value={settings.countPercent}
          min={0.05}
          max={100}
          step={0.05}
          suffix="%"
          onChange={(countPercent) => onChange({ countPercent })}
        />
        <NumberField
          label="Min 24h volume"
          hint="Thin books fake pumps; this hides them."
          value={settings.minVolume}
          min={0}
          max={100_000_000}
          step={50_000}
          suffix="$"
          onChange={(minVolume) => onChange({ minVolume })}
        />
        <NumberField
          label="Counter reset"
          hint="How often every counter goes back to zero."
          value={settings.resetMinutes}
          min={1}
          max={240}
          step={1}
          suffix="min"
          onChange={(resetMinutes) => onChange({ resetMinutes })}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={settings.alertFavoritesOnly}
            onChange={(e) => onChange({ alertFavoritesOnly: e.target.checked })}
            className="size-4 cursor-pointer accent-[var(--color-brand)]"
          />
          Only alert on favorites
        </label>
        <button
          type="button"
          onClick={onResetCounts}
          className="cursor-pointer rounded-[20px] bg-brand px-4 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-50"
        >
          Reset counters now
        </button>
      </div>
    </div>
  );
}
