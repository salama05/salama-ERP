"use client";

import {
  useState,
  type ReactNode,
  type Key,
} from "react";
import { Search, X, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n, getLocaleForLanguage } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */
export interface Column<T> {
  /** Unique identifier for the column */
  key:        string;
  /** Header text */
  header:     string;
  /** Cell renderer — receives the row object */
  cell:       (row: T) => ReactNode;
  /** If true, clicking the header sorts by this column */
  sortable?:  boolean;
  /** CSS width / min-width */
  width?:     string;
  /** Align cell content */
  align?:     "start" | "center" | "end";
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key:        string;
  label:      string;
  options:    FilterOption[];
}

interface DataTableProps<T> {
  /** Row data */
  data:           T[];
  /** Column definitions */
  columns:        Column<T>[];
  /** Row key extractor */
  rowKey:         (row: T) => Key;

  /* ── Search ── */
  searchable?:    boolean;
  searchPlaceholder?: string;
  onSearch?:      (term: string) => void;
  searchTerm?:    string;

  /* ── Filters ── */
  filters?:       FilterConfig[];
  activeFilters?: Record<string, string>;
  onFilter?:      (key: string, value: string) => void;

  /* ── Header ── */
  title?:         string;
  description?:   string;
  actions?:       ReactNode;

  /* ── Empty state ── */
  emptyTitle?:    string;
  emptyDesc?:     string;
  emptyAction?:   { label: string; href?: string; onClick?: () => void };

  /* ── Loading ── */
  loading?:       boolean;

  /* ── i18n ── */
  dir?:           "ltr" | "rtl";
  language?:      "fr" | "ar" | "en";

  /** Optional footer (e.g. pagination) */
  footer?:        ReactNode;

  className?:     string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON ROW
   ═══════════════════════════════════════════════════════════════════════════ */
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div
            className="skeleton"
            style={{
              height:       "14px",
              width:        i === 0 ? "60%" : i === cols - 1 ? "40%" : "80%",
              borderRadius: "var(--radius-sm)",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SORT ICON
   ═══════════════════════════════════════════════════════════════════════════ */
function SortIcon({ state }: { state: "asc" | "desc" | null }) {
  const style = { width: 14, height: 14, flexShrink: 0, color: "var(--color-text-disabled)" };
  if (state === "asc")  return <ChevronUp  style={{ ...style, color: "var(--color-brand)" }} />;
  if (state === "desc") return <ChevronDown style={{ ...style, color: "var(--color-brand)" }} />;
  return <ChevronsUpDown style={style} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchable      = true,
  searchPlaceholder,
  onSearch,
  searchTerm: externalSearchTerm,
  filters,
  activeFilters   = {},
  onFilter,
  title,
  description,
  actions,
  emptyTitle,
  emptyDesc,
  emptyAction,
  loading         = false,
  dir             = "ltr",
  language        = "fr",
  footer,
  className,
}: DataTableProps<T>) {
  const isRTL = dir === "rtl";

  /* Internal search state (if no external handler) */
  const [internalSearch, setInternalSearch] = useState("");
  const searchTerm =
    externalSearchTerm !== undefined ? externalSearchTerm : internalSearch;
  const handleSearch = (v: string) => {
    if (onSearch) onSearch(v);
    else setInternalSearch(v);
  };

  /* Sort state */
  const [sortKey,  setSortKey]  = useState<string | null>(null);
  const [sortDir,  setSortDir]  = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* Derive displayed rows */
  let rows = [...data];

  /* Client-side search fallback (when no external handler) */
  if (!onSearch && searchTerm) {
    const term = searchTerm.toLowerCase();
    rows = rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(term)
    );
  }

  /* Client-side sort */
  if (sortKey) {
    rows.sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey];
      const vb = (b as Record<string, unknown>)[sortKey];
      if (va === undefined || vb === undefined) return 0;
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  /* Texts */
  const txt = {
    search:      language === "ar" ? "بحث..." : language === "en" ? "Search..." : "Rechercher...",
    noResults:   language === "ar" ? "لا توجد نتائج" : language === "en" ? "No results" : "Aucun résultat",
    noResultsD:  language === "ar" ? "جرّب بحثاً مختلفاً" : language === "en" ? "Try a different search" : "Essayez une autre recherche",
    emptyT:      emptyTitle  ?? (language === "ar" ? "لا توجد بيانات" : language === "en" ? "No data" : "Aucune donnée"),
    emptyD:      emptyDesc   ?? (language === "ar" ? "ابدأ بإضافة أول سجل" : language === "en" ? "Start by creating your first record" : "Commencez par créer votre premier enregistrement"),
    addNew:      language === "ar" ? "إضافة جديد" : language === "en" ? "Add new" : "Créer",
    allFilter:   language === "ar" ? "الكل" : language === "en" ? "All" : "Tous",
    results:     (n: number) => language === "ar" ? `${n} نتيجة` : language === "en" ? `${n} result${n !== 1 ? "s" : ""}` : `${n} résultat${n > 1 ? "s" : ""}`,
  };

  const isEmpty = !loading && rows.length === 0;

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      style={{ animation: "fadeUp 0.3s ease both" }}
    >
      {/* ── TABLE CARD ───────────────────────────────────────────────── */}
      <div
        className="card overflow-hidden"
        style={{ "--card-radius": "var(--radius-lg)" } as React.CSSProperties}
      >

        {/* ── CARD HEADER (title + search + filters) ─── */}
        <div
          style={{
            padding:      "18px 20px 0",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          {/* Top row: title / actions */}
          {(title || actions) && (
            <div
              className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}
            >
              <div className={cn("min-w-0", isRTL && "text-right")}>
                {title && (
                  <h2
                    className="text-heading-sm truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-caption mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className={cn("flex items-center gap-2 flex-shrink-0", isRTL && "flex-row-reverse")}>
                  {actions}
                </div>
              )}
            </div>
          )}

          {/* Search + filter row */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 pb-4",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* Search input */}
            {searchable && (
              <div
                className={cn(
                  "flex items-center gap-2 flex-1 min-w-[200px] max-w-sm rounded-xl px-3",
                  isRTL && "flex-row-reverse"
                )}
                style={{
                  height:     "38px",
                  background: "var(--color-bg-surface)",
                  border:     "1px solid var(--color-border)",
                  transition: "border-color var(--t-base)",
                }}
                onFocusCapture={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-brand)")
                }
                onBlurCapture={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-border)")
                }
              >
                <Search
                  className="flex-shrink-0"
                  style={{ width: 15, height: 15, color: "var(--color-text-muted)" }}
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder ?? txt.search}
                  className={cn("flex-1 bg-transparent outline-none border-none text-sm", isRTL && "text-right")}
                  style={{ color: "var(--color-text-primary)", fontFamily: "inherit" }}
                  dir={dir}
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch("")}
                    aria-label="Clear search"
                    style={{
                      color:      "var(--color-text-muted)",
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      padding:    0,
                      display:    "flex",
                    }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            )}

            {/* Filter pills */}
            {filters && filters.map((filter) => (
              <div
                key={filter.key}
                className={cn("flex items-center gap-1 rounded-full p-1", isRTL && "flex-row-reverse")}
                style={{
                  background: "var(--color-bg-surface)",
                  border:     "1px solid var(--color-border)",
                }}
              >
                {[{ label: txt.allFilter, value: "" }, ...filter.options].map((opt) => {
                  const isActive = (activeFilters[filter.key] ?? "") === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onFilter?.(filter.key, opt.value)}
                      className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150"
                      style={
                        isActive
                          ? { background: "var(--color-brand)", color: "#fff" }
                          : { color: "var(--color-text-muted)" }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Result count chip */}
            {!loading && (
              <span
                className="ms-auto text-caption rounded-full px-2.5 py-1"
                style={{
                  background: "var(--color-bg-surface)",
                  border:     "1px solid var(--color-border-subtle)",
                  color:      "var(--color-text-muted)",
                }}
              >
                {txt.results(rows.length)}
              </span>
            )}
          </div>
        </div>

        {/* ── TABLE ───────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="premium-table" dir={dir}>
            <thead>
              <tr>
                {columns.map((col) => {
                  const sortState =
                    sortKey === col.key
                      ? sortDir
                      : null;

                  return (
                    <th
                      key={col.key}
                      className={cn(
                        col.hideOnMobile && "hidden sm:table-cell",
                        col.sortable && "cursor-pointer select-none",
                        "group"
                      )}
                      style={{
                        width:     col.width,
                        textAlign: col.align === "center" ? "center"
                                 : col.align === "end"    ? (isRTL ? "left"  : "right")
                                 :                          (isRTL ? "right" : "left"),
                      }}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          col.sortable && "group-hover:text-[var(--color-text-primary)]",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        {col.header}
                        {col.sortable && <SortIcon state={sortState} />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Loading skeletons */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))}

              {/* Data rows */}
              {!loading && rows.map((row, rowIdx) => (
                <tr
                  key={rowKey(row)}
                  className="group stagger-children"
                  style={{ animationDelay: `${rowIdx * 30}ms` }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(col.hideOnMobile && "hidden sm:table-cell")}
                      style={{
                        textAlign: col.align === "center" ? "center"
                                 : col.align === "end"    ? (isRTL ? "left"  : "right")
                                 :                          (isRTL ? "right" : "left"),
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty state */}
              {isEmpty && (
                <tr>
                  <td colSpan={columns.length}>
                    <div
                      className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in"
                    >
                      {/* Icon ring */}
                      <div
                        className="relative flex items-center justify-center rounded-full"
                        style={{
                          width:      72,
                          height:     72,
                          background: "var(--color-bg-surface)",
                          border:     "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <Inbox
                          style={{ width: 32, height: 32, color: "var(--color-text-disabled)" }}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="text-center">
                        <p
                          className="text-heading-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {searchTerm ? txt.noResults : txt.emptyT}
                        </p>
                        <p className="text-caption mt-1">
                          {searchTerm ? txt.noResultsD : txt.emptyD}
                        </p>
                      </div>

                      {!searchTerm && emptyAction && (
                        emptyAction.href ? (
                          <Link
                            href={emptyAction.href}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                            style={{
                              background: "var(--color-brand)",
                              transition: "all var(--t-base)",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = "var(--color-brand-light)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = "var(--color-brand)")
                            }
                          >
                            <Plus style={{ width: 16, height: 16 }} />
                            {emptyAction.label}
                          </Link>
                        ) : (
                          <button
                            onClick={emptyAction.onClick}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95"
                            style={{ background: "var(--color-brand)" }}
                          >
                            <Plus style={{ width: 16, height: 16 }} />
                            {emptyAction.label}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Optional footer */}
        {footer && (
          <div
            style={{
              padding:     "14px 20px",
              borderTop:   "1px solid var(--color-border-subtle)",
              background:  "var(--color-bg-surface)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR CELL HELPER — Use inside column.cell() for Name columns
   ═══════════════════════════════════════════════════════════════════════════ */
export function AvatarCell({
  name,
  subtitle,
  avatarColor,
  dir = "ltr",
}: {
  name:         string;
  subtitle?:    string;
  avatarColor?: string;
  dir?:         "ltr" | "rtl";
}) {
  const isRTL = dir === "rtl";
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isRTL && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-xs text-white"
        style={{
          width:      34,
          height:     34,
          background: avatarColor ?? "linear-gradient(135deg, var(--color-brand-light), var(--color-brand))",
        }}
      >
        {initial}
      </div>

      {/* Text */}
      <div className={cn("min-w-0", isRTL && "text-right")}>
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {name}
        </p>
        {subtitle && (
          <p className="text-caption truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICE CELL HELPER
   ═══════════════════════════════════════════════════════════════════════════ */
export function PriceCell({
  amount,
  currency = "DZD",
  locale,
  highlight,
}: {
  amount:    number;
  currency?: string;
  locale?:   string;
  highlight?: "danger" | "success" | "warning";
}) {
  const { language } = useI18n();
  const activeLocale = locale || getLocaleForLanguage(language);
  const formatted = amount.toLocaleString(activeLocale, {
    style:    "currency",
    currency,
    maximumFractionDigits: 2,
  });

  const color =
    highlight === "danger"  ? "var(--color-danger)"  :
    highlight === "success" ? "var(--color-success)"  :
    highlight === "warning" ? "var(--color-warning)"  :
    "var(--color-text-primary)";

  return (
    <span className="text-price" style={{ color, letterSpacing: "-0.02em" }}>
      {formatted}
    </span>
  );
}
