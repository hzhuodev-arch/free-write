import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import {
  EllipsisVertical,
  FileText,
  PanelLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePersistedState } from "#/hooks/use-persisted-state";
import { useUserId } from "#/hooks/use-user-id";
import { cn, timeAgo } from "@/lib/utils";

function docTitle(doc: Doc<"documents">): string {
  if (doc.title.trim()) return doc.title;
  if (doc.content.trim()) {
    const first = doc.content.trim().split("\n")[0].slice(0, 40);
    return first || "Untitled";
  }
  return "Untitled";
}

const SIDEBAR_WIDTH = "14rem"; // w-56
const COLLAPSED_WIDTH = "2.75rem"; // w-11

interface SidebarProps {
  documents: Doc<"documents">[];
  selectedDocId: string | null;
  onCreate: () => void;
  onSelect: (docId: Id<"documents">) => void;
}

export default function Sidebar({
  documents,
  selectedDocId,
  onCreate,
  onSelect,
}: SidebarProps) {
  const userId = useUserId();
  
  const [open, setOpen] = usePersistedState("free-write:side-bar-open", true);
  const [deletionTarget, setDeletionTarget] = useState<Doc<"documents"> | null>(
    null,
  );

  const renameDoc = useMutation(api.document.updateTitle).withOptimisticUpdate(
    (store, args) => {
      store.setQuery(
        api.document.collectByUserId,
        { userId },
        documents.map((doc) =>
          doc._id === args.id ? { ...doc, title: args.title } : doc,
        ),
      );
    },
  );

  const deleteDoc = useMutation(api.document.remove).withOptimisticUpdate(
    (store, args) => {
      if (!userId) return;
      const current = store.getQuery(api.document.collectByUserId, { userId });
      if (current === undefined) return;
      store.setQuery(
        api.document.collectByUserId,
        { userId },
        current.filter((doc) => doc._id !== args.id),
      );
    },
  );

  function toggle() {
    setOpen(!open);
  }

  function handleRename(docId: Id<"documents">, title: string) {
    renameDoc({ id: docId, title });
  }

  function handleDeleteRequest(target: Doc<"documents">) {
    if (target.content.trim() === "") {
      return deleteDoc({ id: target._id });
    }
    return setDeletionTarget(target);
  }

  function confirmDelete() {
    if (!deletionTarget) return;
    deleteDoc({ id: deletionTarget._id });
    setDeletionTarget(null);
  }

  return (
    <div
      style={{ width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH }}
      className={cn(
        "flex shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out overflow-hidden",
        "border-zinc-200 bg-zinc-50/60",
        "dark:border-zinc-800 dark:bg-zinc-950/60",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-11 shrink-0 items-center border-b",
          open ? "justify-between px-3" : "justify-center",
          "border-zinc-200 dark:border-zinc-800",
        )}
      >
        {open ? (
          <>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100">
                <svg
                  viewBox="0 0 14 14"
                  className="h-2.5 w-2.5 fill-white dark:fill-zinc-900"
                  aria-hidden="true"
                >
                  <path d="M2 2h4v10H2zM8 2h4v6H8zM8 10h4v2H8z" />
                </svg>
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[12px] font-semibold tracking-tight",
                  "text-zinc-900 dark:text-zinc-100",
                )}
              >
                Free Write
              </span>
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded",
                "text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-600",
                "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              )}
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label="Open sidebar"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md",
              "text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-600",
              "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
            )}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expandable content */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-opacity duration-200 ease-in-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* New doc button */}
        <div className="px-2 pt-2">
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              "flex w-full items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5",
              "text-[12px] font-medium",
              "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700",
              "dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            New document
          </button>
        </div>

        {/* Document list */}
        <nav className="mt-1 flex-1 overflow-y-auto px-2 pb-3">
          {documents.map((doc) => (
            <DocumentItem
              key={doc._id}
              doc={doc}
              isActive={doc._id === selectedDocId}
              onSelect={() => onSelect(doc._id)}
              onRename={(title) => handleRename(doc._id, title)}
              onDelete={() => handleDeleteRequest(doc)}
            />
          ))}
        </nav>
      </div>

      {/* Delete confirmation dialog (shared) */}
      {deletionTarget &&
        createPortal(
          <DeleteDialog
            docTitle={docTitle(deletionTarget)}
            onConfirm={confirmDelete}
            onCancel={() => setDeletionTarget(null)}
          />,
          document.body,
        )}
    </div>
  );
}

// ── Document item ───────────────────────────────────────────────────────

function DocumentItem({
  doc,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  doc: Doc<"documents">;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  function startRename() {
    setMenuOpen(false);
    setRenaming(true);
    setRenameValue(docTitle(doc));
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed) {
      onRename(trimmed);
    }
    setRenaming(false);
  }

  function handleDelete() {
    setMenuOpen(false);
    onDelete();
  }

  const iconClass = cn(
    "mt-0.5 h-3.5 w-3.5 shrink-0",
    isActive
      ? "text-zinc-500 dark:text-zinc-400"
      : "text-zinc-400 dark:text-zinc-600",
  );

  const activeClass = [
    "bg-zinc-200/60 text-zinc-900",
    "dark:bg-zinc-800/60 dark:text-zinc-100",
  ];

  return (
    <div className="group relative my-0.5">
      {renaming ? (
        <div
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2 py-2",
            isActive ? activeClass : "text-zinc-600 dark:text-zinc-400",
          )}
        >
          <FileText className={iconClass} />
          <div className="min-w-0 flex-1">
            <RenameInput
              value={renameValue}
              onChange={setRenameValue}
              onCommit={commitRename}
              onCancel={() => setRenaming(false)}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left",
            isActive
              ? activeClass
              : [
                  "text-zinc-600 group-hover:bg-zinc-200/40 group-hover:text-zinc-800",
                  "dark:text-zinc-400 dark:group-hover:bg-zinc-800/40 dark:group-hover:text-zinc-200",
                ],
          )}
        >
          <FileText className={iconClass} />
          <div className="min-w-0 flex-1">
            <div className="truncate whitespace-nowrap text-[12px] font-medium leading-tight">
              {docTitle(doc)}
            </div>
            <div
              className={cn(
                "mt-0.5 whitespace-nowrap text-[10px] leading-tight",
                "text-zinc-400 dark:text-zinc-600",
              )}
            >
              {timeAgo(doc._creationTime)}
            </div>
          </div>
        </button>
      )}

      {!renaming && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Document options"
          className={cn(
            "absolute right-1.5 top-1/2 -translate-y-1/2",
            "flex h-5 w-5 items-center justify-center rounded",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "text-zinc-400 hover:text-zinc-600",
            "dark:text-zinc-600 dark:hover:text-zinc-300",
          )}
        >
          <EllipsisVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {menuOpen && (
        <DocMenu
          onRename={startRename}
          onDelete={handleDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function DocMenu({
  onRename,
  onDelete,
  onClose,
}: {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const itemClass = cn(
    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left",
    "text-[12px] font-medium",
  );

  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 top-full z-50 mt-0.5 w-36 overflow-hidden rounded-md border py-1 shadow-lg",
        "border-zinc-200 bg-white",
        "dark:border-zinc-700 dark:bg-zinc-900",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className={cn(
          itemClass,
          "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
          "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
        )}
      >
        <Pencil className="h-3 w-3 shrink-0" />
        Rename
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          itemClass,
          "text-red-600 hover:bg-red-50 hover:text-red-700",
          "dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300",
        )}
      >
        <Trash2 className="h-3 w-3 shrink-0" />
        Delete
      </button>
    </div>
  );
}

function RenameInput({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") onCommit();
        if (e.key === "Escape") onCancel();
      }}
      onClick={(e) => e.stopPropagation()}
      onBlur={onCommit}
      className={cn(
        "w-full rounded px-1 py-0.5 text-[12px] font-medium leading-tight outline-none",
        "border border-zinc-300 bg-white text-zinc-900",
        "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
        "focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300",
        "dark:focus:border-zinc-500 dark:focus:ring-zinc-600",
      )}
    />
  );
}

function DeleteDialog({
  docTitle,
  onConfirm,
  onCancel,
}: {
  docTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-label="Delete document"
        className={cn(
          "relative w-80 rounded-lg border p-5 shadow-xl",
          "border-zinc-200 bg-white",
          "dark:border-zinc-700 dark:bg-zinc-900",
        )}
      >
        <h3
          className={cn(
            "text-sm font-semibold",
            "text-zinc-900 dark:text-zinc-100",
          )}
        >
          Delete document
        </h3>
        <p
          className={cn(
            "mt-2 text-[13px] leading-relaxed",
            "text-zinc-500 dark:text-zinc-400",
          )}
        >
          Are you sure you want to delete{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">
            {docTitle}
          </span>
          ? This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium",
              "text-zinc-600 hover:bg-zinc-100",
              "dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium",
              "bg-red-600 text-white hover:bg-red-700",
              "dark:bg-red-600 dark:hover:bg-red-500",
            )}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
