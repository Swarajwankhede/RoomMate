import React, { useMemo, useState } from "react";

/**
 * Search-to-add people picker. Type to filter, click a result to add them,
 * selected people show as removable chips right below the search bar.
 *
 * options: [{ id, name, isSelf?, color? }]
 * selectedIds: string[]
 * onChange(nextSelectedIds)
 * lockedIds: ids that are always selected and can't be removed (e.g. you,
 *            or whoever paid) — shown as chips without a remove button.
 */
export default function PeoplePicker({ options, selectedIds, onChange, lockedIds = [], placeholder }) {
  const [query, setQuery] = useState("");

  const displayName = (p) => (p.isSelf ? "You" : p.name);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((p) => !selectedIds.includes(p.id))
      .filter((p) => !q || displayName(p).toLowerCase().includes(q));
  }, [options, selectedIds, query]);

  const selected = selectedIds
    .map((id) => options.find((p) => p.id === id))
    .filter(Boolean);

  function add(id) {
    onChange([...selectedIds, id]);
    setQuery("");
  }
  function remove(id) {
    if (lockedIds.includes(id)) return;
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <div className="people-picker">
      {selected.length > 0 && (
        <div className="picker-chips">
          {selected.map((p) => (
            <span className="picker-chip" key={p.id}>
              <span className="avatar-dot" style={{ background: p.color || "#8B93A6" }} />
              {displayName(p)}
              {!lockedIds.includes(p.id) && (
                <button type="button" aria-label={`Remove ${displayName(p)}`} onClick={() => remove(p.id)}>
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        className="picker-search"
        value={query}
        placeholder={placeholder || "Search people to add…"}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <div className="picker-results">
          {results.length === 0 ? (
            <div className="picker-empty">No matching people</div>
          ) : (
            results.map((p) => (
              <button type="button" className="picker-result" key={p.id} onClick={() => add(p.id)}>
                <span className="avatar-dot" style={{ background: p.color || "#8B93A6" }} />
                {displayName(p)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
