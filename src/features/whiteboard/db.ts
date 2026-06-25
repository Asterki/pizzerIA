import { get, set, del, update, createStore } from "idb-keyval";

import type {
  RawWhiteboard,
  Whiteboard,
  WhiteboardNode,
  ChatThread,
  WhiteboardsStore,
} from "./types";

const STORE_KEY = "whiteboards" as const;
const whiteboardStore = createStore("whiteboards-db", "whiteboards");

//#region Serialization
export function parseWhiteboard(raw: RawWhiteboard): Whiteboard {
  const nodes: WhiteboardNode[] = JSON.parse(raw.nodes);
  const chat: ChatThread = JSON.parse(raw.chat);

  return {
    id: raw.id,
    nodes,
    chat,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    title: raw.title,
    thumbnail: raw.thumbnail,
    tags: raw.tags,
    authorId: raw.authorId,
    version: raw.version,
  };
}

export function serialiseWhiteboard(wb: Whiteboard): RawWhiteboard {
  return {
    id: wb.id,
    nodes: JSON.stringify(wb.nodes),
    chat: JSON.stringify(wb.chat),
    createdAt: wb.createdAt,
    updatedAt: wb.updatedAt,
    title: wb.title,
    thumbnail: wb.thumbnail,
    tags: wb.tags,
    authorId: wb.authorId,
    version: wb.version,
  };
}
//#endregion

//#region Raw storage functions
export async function readRawStore(): Promise<WhiteboardsStore> {
  const stored = await get<WhiteboardsStore>(STORE_KEY, whiteboardStore);
  return stored ?? {};
}

export async function writeRawStore(store: WhiteboardsStore): Promise<void> {
  await set(STORE_KEY, store, whiteboardStore);
}
//#endregion


//#region CRUD
export async function getAllWhiteboards(): Promise<Whiteboard[]> {
  const store = await readRawStore();
  return Object.values(store).map(parseWhiteboard);
}

export async function getWhiteboardById(
  id: string
): Promise<Whiteboard | undefined> {
  const store = await readRawStore();
  const raw = store[id];
  return raw ? parseWhiteboard(raw) : undefined;
}

export async function saveWhiteboard(wb: Whiteboard): Promise<void> {
  const raw = serialiseWhiteboard({ ...wb, updatedAt: Date.now() });
  await update<WhiteboardsStore>(
    STORE_KEY,
    (prev = {}) => ({ ...prev, [raw.id]: raw }),
    whiteboardStore
  );
}

export async function deleteWhiteboard(id: string): Promise<void> {
  await update<WhiteboardsStore>(
    STORE_KEY,
    (prev = {}) => {
      const next = { ...prev };
      delete next[id];
      return next;
    },
    whiteboardStore
  );
}

export async function clearAllWhiteboards(): Promise<void> {
  await del(STORE_KEY, whiteboardStore);
}

export async function exportStoreAsJson(): Promise<string> {
  const store = await readRawStore();
  return JSON.stringify(store, null, 2);
}

export async function importStoreFromJson(json: string): Promise<void> {
  const incoming: WhiteboardsStore = JSON.parse(json);
  await update<WhiteboardsStore>(
    STORE_KEY,
    (prev = {}) => ({ ...prev, ...incoming }),
    whiteboardStore
  );
}
//#endregion