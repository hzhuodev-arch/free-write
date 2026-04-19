import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Document } from "@convex/shared/document";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { EllipsisVertical, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUserId } from "#/hooks/use-user-id";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn, timeAgo } from "@/lib/utils";

function docTitle(doc: Document): string {
  if (doc.title.trim()) return doc.title;
  if (doc.content.trim()) {
    const first = doc.content.trim().split("\n")[0].slice(0, 40);
    return first || "Untitled";
  }
  return "Untitled";
}

interface AppSidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  onCreate: () => void;
  onSelect: (docId: string) => void;
}

export default function AppSidebar({
  documents,
  selectedDocId,
  onCreate,
  onSelect,
}: AppSidebarProps) {
  const userId = useUserId();
  const [deletionTarget, setDeletionTarget] = useState<Document | null>(
    null,
  );

  const renameDoc = useMutation(api.documents.updateTitle).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.documents.listByUserId, { userId });
      if (current === undefined) return;
      store.setQuery(
        api.documents.listByUserId,
        { userId },
        current.map((doc) =>
          doc.id === args.id ? { ...doc, title: args.title } : doc,
        ),
      );
    },
  );

  const deleteDoc = useMutation(api.documents.remove).withOptimisticUpdate(
    (store, args) => {
      if (!userId) return;
      const current = store.getQuery(api.documents.listByUserId, { userId });
      if (current === undefined) return;
      store.setQuery(
        api.documents.listByUserId,
        { userId },
        current.filter((doc) => doc.id !== args.id),
      );
    },
  );

  function handleRename(docId: string, title: string) {
    renameDoc({ id: docId as Id<"documents">, title });
  }

  function handleDeleteRequest(target: Document) {
    if (target.content.trim() === "") {
      return deleteDoc({ id: target.id as Id<"documents"> });
    }
    return setDeletionTarget(target);
  }

  function confirmDelete() {
    if (!deletionTarget) return;
    deleteDoc({ id: deletionTarget.id as Id<"documents"> });
    setDeletionTarget(null);
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="p-0">
        <div
          className={cn(
            "flex h-11 shrink-0 items-center px-3 border-b",
            "border-sidebar-border",
          )}
        >
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
                "text-sidebar-foreground",
                "group-data-[collapsible=icon]:hidden",
              )}
            >
              Free Write
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup className="px-2 pt-2">
          {/* New document button */}
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              "flex w-full items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5",
              "text-[12px] font-medium",
              "text-zinc-500 hover:bg-sidebar-accent hover:text-zinc-700",
              "dark:text-zinc-400 dark:hover:text-zinc-200",
              "group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:justify-center",
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              New document
            </span>
          </button>

          {/* Document list */}
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {documents.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  doc={doc}
                  isActive={doc.id === selectedDocId}
                  onSelect={() => onSelect(doc.id)}
                  onRename={(title) => handleRename(doc.id, title)}
                  onDelete={() => handleDeleteRequest(doc)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rail for hover-to-expand */}
      <SidebarRail />

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
    </Sidebar>
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
  doc: Document;
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

  return (
    <SidebarMenuItem>
      {renaming ? (
        <div
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2 py-2",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground",
          )}
        >
          <FileText
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0",
              isActive
                ? "text-zinc-500 dark:text-zinc-400"
                : "text-zinc-400 dark:text-zinc-600",
            )}
          />
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
        <SidebarMenuButton
          isActive={isActive}
          onClick={onSelect}
          size="sm"
          tooltip={docTitle(doc)}
          className={cn(
            "items-start py-2 h-auto",
            !isActive && [
              "text-zinc-600 dark:text-zinc-400",
              "hover:text-zinc-800 dark:hover:text-zinc-200",
              "group-hover/menu-item:bg-sidebar-accent",
            ],
          )}
        >
          <FileText
            className={cn(
              "mt-0.5 !h-3.5 !w-3.5 shrink-0",
              isActive
                ? "text-zinc-500 dark:text-zinc-400"
                : "text-zinc-400 dark:text-zinc-600",
            )}
          />
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
              {timeAgo(doc.creationTime)}
            </div>
          </div>
        </SidebarMenuButton>
      )}

      {!renaming && (
        <SidebarMenuAction
          showOnHover
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Document options"
          className={cn(
            "top-1/2! -translate-y-1/2",
            "text-zinc-400 hover:text-zinc-600 hover:bg-transparent!",
            "dark:text-zinc-600 dark:hover:text-zinc-300",
            menuOpen && "!opacity-100",
          )}
        >
          <EllipsisVertical className="!h-3.5 !w-3.5" />
        </SidebarMenuAction>
      )}

      {menuOpen && (
        <DocMenu
          onRename={startRename}
          onDelete={handleDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </SidebarMenuItem>
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
