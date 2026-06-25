import { useState, useEffect, useCallback } from "react";

import {
  getAllWhiteboards,
  saveWhiteboard,
  deleteWhiteboard,
  clearAllWhiteboards,
} from "../db";

import type { Whiteboard, UseWhiteboardsReturn } from "../types";
import { getSearchableText, normalize } from "../utils";

export function useWhiteboards(): UseWhiteboardsReturn & {
  // Events
  save: (wb: Whiteboard) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
} {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  //#region Fetching
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await getAllWhiteboards();
      setWhiteboards(all);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);
  //#endregion


  //#region Mutations
  const save = useCallback(
    async (wb: Whiteboard) => {
      await saveWhiteboard(wb);
      await refetch();
    },
    [refetch]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteWhiteboard(id);
      setWhiteboards((prev) => prev.filter((w) => w.id !== id));
    },
    []
  );

  const clear = useCallback(async () => {
    await clearAllWhiteboards();
    setWhiteboards([]);
  }, []);
  //#endregion


  //#region Query
  const getById = useCallback(
    (id: string) => whiteboards.find((w) => w.id === id),
    [whiteboards]
  );

  const search = useCallback(
    (query: string): Whiteboard[] => {
      if (!query.trim()) return whiteboards;
      const needle = normalize(query);
      return whiteboards.filter((wb) =>
        getSearchableText(wb).includes(needle)
      );
    },
    [whiteboards]
  );

  const filterByTags = useCallback(
    (tags: string[]): Whiteboard[] => {
      if (!tags.length) return whiteboards;
      return whiteboards.filter((wb) =>
        tags.every((tag) => wb.tags?.includes(tag))
      );
    },
    [whiteboards]
  );

  const filterByAuthor = useCallback(
    (authorId: string): Whiteboard[] =>
      whiteboards.filter((wb) => wb.authorId === authorId),
    [whiteboards]
  );

  const filterByDateRange = useCallback(
    (from: number, to: number): Whiteboard[] =>
      whiteboards.filter(
        (wb) => wb.updatedAt >= from && wb.updatedAt <= to
      ),
    [whiteboards]
  );
  //#endregion

  //#region Sorting 
  const sortByDate = useCallback(
    (order: "asc" | "desc" = "desc"): Whiteboard[] =>
      [...whiteboards].sort((a, b) =>
        order === "desc"
          ? b.updatedAt - a.updatedAt
          : a.updatedAt - b.updatedAt
      ),
    [whiteboards]
  );

  const sortByTitle = useCallback(
    (order: "asc" | "desc" = "asc"): Whiteboard[] =>
      [...whiteboards].sort((a, b) => {
        const ta = a.title ?? "\uFFFF";
        const tb = b.title ?? "\uFFFF";
        return order === "asc"
          ? ta.localeCompare(tb)
          : tb.localeCompare(ta);
      }),
    [whiteboards]
  );
  //#endregion

  return {
    whiteboards,
    isLoading,
    error,
    refetch,
    getById,
    search,
    filterByTags,
    filterByAuthor,
    filterByDateRange,
    sortByDate,
    sortByTitle,
    save,
    remove,
    clear,
  };
}