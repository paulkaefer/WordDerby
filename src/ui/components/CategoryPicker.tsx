import type { CategoryMode, CategorySelection } from "../../engine/categories";

interface CategoryPickerProps {
  categories: string[];
  selection: CategorySelection;
  onChange: (selection: CategorySelection) => void;
  /** Open by default (e.g. between rounds). */
  defaultOpen?: boolean;
  /** When set, shows a button that abandons the current round and starts a new one now. */
  onStartNow?: () => void;
}

const MODES: { value: CategoryMode; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "random", label: "Random category each round" },
  { value: "selected", label: "Pick categories" },
];

const title = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

/** Changes apply to the next round; the round in progress is never altered. */
export function CategoryPicker({
  categories,
  selection,
  onChange,
  defaultOpen = false,
  onStartNow,
}: CategoryPickerProps) {
  const toggle = (c: string) => {
    const has = selection.categories.includes(c);
    onChange({
      ...selection,
      categories: has ? selection.categories.filter((x) => x !== c) : [...selection.categories, c],
    });
  };

  return (
    <details className="category-picker" open={defaultOpen}>
      <summary>Word categories</summary>
      <fieldset>
        <legend>Next round uses</legend>
        {MODES.map((m) => (
          <label key={m.value} className="category-picker__option">
            <input
              type="radio"
              name="category-mode"
              checked={selection.mode === m.value}
              onChange={() => onChange({ ...selection, mode: m.value })}
            />
            {m.label}
          </label>
        ))}
      </fieldset>
      {selection.mode === "selected" && (
        <fieldset>
          <legend>Choose one or more (none chosen = all)</legend>
          <div className="category-picker__list">
            {categories.map((c) => (
              <label key={c} className="category-picker__option">
                <input
                  type="checkbox"
                  checked={selection.categories.includes(c)}
                  onChange={() => toggle(c)}
                />
                {title(c)}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {onStartNow && (
        <button type="button" onClick={onStartNow}>
          Start a new round now with these categories
        </button>
      )}
    </details>
  );
}
