import React from "react";
import { Trie } from "../lib/search/trie";
import lookups from "../generated/lookups.json";
import type { SearchResults } from "../lib/search/search";

const autocomplete = new Trie(Object.entries(lookups));
const groups = [
  ["pages", "Pages"],
  ["books", "Books"],
  ["stories", "Stories"],
  ["projects", "Projects"],
  ["posts", "Blog Posts"],
] as const;
type ResultItem = { title: string; url?: string; slug: string; type?: string };

export default function SearchIsland() {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const worker = React.useRef<Worker | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [completion, setCompletion] = React.useState<string | undefined>();
  const [showResultCount, setShowResultCount] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const instance = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.current = instance;
    instance.addEventListener(
      "message",
      (event: MessageEvent<SearchResults | null>) => setResults(event.data),
    );
    const open = () => {
      if (!dialog.current?.open) dialog.current?.showModal();
    };
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key === "/" && !typing) {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener("open-site-search", open);
    document.addEventListener("keydown", shortcut);
    return () => {
      instance.terminate();
      worker.current = null;
      document.removeEventListener("open-site-search", open);
      document.removeEventListener("keydown", shortcut);
      window.clearTimeout(timer.current);
    };
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    window.clearTimeout(timer.current);
    if (!value) {
      setShowResultCount(false);
      setSuggestions([]);
      setCompletion(undefined);
      timer.current = window.setTimeout(
        () => worker.current?.postMessage({ query: value }),
        0,
      );
      return;
    }
    timer.current = window.setTimeout(
      () => worker.current?.postMessage({ query: value }),
      250,
    );
    const prefix = autocomplete.suggest(value);
    if (!prefix?.length) {
      setCompletion(undefined);
      setSuggestions(autocomplete.getClosestLevenshteinSuggestions(value));
      return;
    }
    const words = prefix.map((option) => option.word);
    setCompletion(words[0]);
    setSuggestions(words);
    setShowResultCount(true);
  }

  function close() {
    dialog.current?.close();
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && query) {
      event.preventDefault();
      event.stopPropagation();
      updateQuery("");
    } else if (
      (event.key === "Enter" || event.key === "Tab") &&
      completion?.startsWith(query)
    ) {
      event.preventDefault();
      updateQuery(completion);
    }
  }
  const resultCount = results
    ? results.books.length +
      results.stories.length +
      results.projects.length +
      results.posts.length +
      results.pages.length
    : 0;
  const hasItems = resultCount > 0;

  return (
    <dialog
      ref={dialog}
      className="search-dialog"
      aria-label="Site search"
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
    >
      <div className="search-panel">
        <div className="search-row">
          <label
            className="search-icon"
            htmlFor="global-search-input"
            aria-hidden="true"
          >
            ⌕
          </label>
          <div className="search-input-wrap">
            <input
              id="global-search-input"
              type="search"
              autoFocus
              value={query}
              onChange={(event) => updateQuery(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search"
              aria-autocomplete="inline"
              aria-describedby="search-autosuggest"
            />
            {completion && (
              <span className="search-completion" aria-hidden="true">
                <span className="search-completion-prefix">{query}</span>
                {completion.slice(query.length)}
              </span>
            )}
          </div>
          {showResultCount && query && (
            <span className="search-count">
              {resultCount} result{resultCount === 1 ? "" : "s"}
            </span>
          )}
          <button
            type="button"
            className="search-close"
            onClick={close}
            aria-label="Close search"
          >
            ×
          </button>
        </div>
        {completion && (
          <span
            id="search-autosuggest"
            className="visually-hidden"
            aria-live="polite"
          >
            Press Tab or Enter to accept the suggestion {completion}
          </span>
        )}
        {results && !hasItems && (
          <div className="search-empty">
            No results found. Did you mean:{" "}
            {suggestions.map((word, index) => (
              <React.Fragment key={`${word}-${index}`}>
                <button type="button" onClick={() => updateQuery(word)}>
                  {word}
                </button>
                {index < suggestions.length - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          </div>
        )}
        {results && hasItems && (
          <div className="search-groups">
            {groups.map(([key, label]) => {
              const items = (results[key] ?? []) as ResultItem[];
              if (!items.length) return null;
              const isOpen = expanded[key] ?? true;
              const panelId = `search-group-${key}`;
              return (
                <section key={key} className="search-group">
                  <h2>
                    <button
                      className="search-group-toggle"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [key]: !isOpen,
                        }))
                      }
                    >
                      <span className="search-group-label">{label}</span>
                      <span className="search-group-eye" aria-hidden="true">
                        {isOpen ? "◉" : "◎"}
                      </span>
                    </button>
                  </h2>
                  <div
                    id={panelId}
                    className="search-group-items"
                    hidden={!isOpen}
                  >
                    {items.map((item, index) => (
                      <a
                        className="search-result"
                        key={`${item.url ?? item.slug}-${index}`}
                        href={item.url ?? item.slug}
                        onClick={close}
                      >
                        <h3 className="search-result-title">{item.title}</h3>
                        <span className="search-result-type">
                          {key === "posts" ? "Blog post" : label.slice(0, -1)}
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </dialog>
  );
}
