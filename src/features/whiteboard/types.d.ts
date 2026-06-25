export type NodeType =
  | "text"
  | "image"
  | "shape"
  | "sticky"
  | "connector"
  | "embed"
  | "group";

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

export interface BaseNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  size: NodeSize;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
  label?: string;
  style?: Record<string, string | number>;
  metadata?: Record<string, unknown>;
}

export interface TextNode extends BaseNode {
  type: "text";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
}

export interface ImageNode extends BaseNode {
  type: "image";
  src: string;
  alt?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export interface StickyNode extends BaseNode {
  type: "sticky";
  content: string;
  color?: string;
}

export interface ShapeNode extends BaseNode {
  type: "shape";
  shape: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "arrow";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ConnectorNode extends BaseNode {
  type: "connector";
  from: string;        // Node id
  to: string;          // Node id
  line?: "straight" | "curved" | "elbow";
  arrowStart?: boolean;
  arrowEnd?: boolean;
  stroke?: string;
}

export interface EmbedNode extends BaseNode {
  type: "embed";
  url: string;
  embedType: "iframe" | "video" | "pdf";
}

export interface GroupNode extends BaseNode {
  type: "group";
  childIds: string[];
}

export type WhiteboardNode =
  | TextNode
  | ImageNode
  | StickyNode
  | ShapeNode
  | ConnectorNode
  | EmbedNode
  | GroupNode;

// ── Chat types ────────────────────────────────────────────────────────────────

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatContentType = "text" | "image" | "file" | "code" | "markdown";

export interface ChatTextContent {
  type: "text";
  text: string;
}

export interface ChatImageContent {
  type: "image";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface ChatFileContent {
  type: "file";
  url: string;
  fileName: string;
  mimeType: string;
  size?: number;
}

export interface ChatCodeContent {
  type: "code";
  code: string;
  language?: string;
  filename?: string;
}

export interface ChatMarkdownContent {
  type: "markdown";
  markdown: string;
}

export type ChatContent =
  | ChatTextContent
  | ChatImageContent
  | ChatFileContent
  | ChatCodeContent
  | ChatMarkdownContent;

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: ChatContent[];
  timestamp: number;          // Unix ms
  editedAt?: number;
  replyToId?: string;
  reactions?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface ChatThread {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
  tags?: string[];
}

// ── Whiteboard ─────────────────────────────────────────────────────────────────

/**
 * Raw shape stored in idb-keyval.
 * `nodes` and `chat` are JSON strings for compact serialisation.
 */
export interface RawWhiteboard {
  id: string;
  /** JSON-serialised WhiteboardNode[] */
  nodes: string;
  /** JSON-serialised ChatThread */
  chat: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  thumbnail?: string;
  tags?: string[];
  authorId?: string;
  version?: number;
}

/**
 * Parsed / hydrated shape used at runtime.
 */
export interface Whiteboard {
  id: string;
  nodes: WhiteboardNode[];
  chat: ChatThread;
  createdAt: number;
  updatedAt: number;
  title?: string;
  thumbnail?: string;
  tags?: string[];
  authorId?: string;
  version?: number;
}

// ── DB / Store types ──────────────────────────────────────────────────────────

export type WhiteboardsStore = Record<string, RawWhiteboard>;

// ── Hook return type ──────────────────────────────────────────────────────────

export interface UseWhiteboardsReturn {
  /** All parsed whiteboards */
  whiteboards: Whiteboard[];
  /** Loading state */
  isLoading: boolean;
  /** Error if persistence failed */
  error: Error | null;
  /** Reload from IndexedDB */
  refetch: () => Promise<void>;
  /** Retrieve a single whiteboard by id */
  getById: (id: string) => Whiteboard | undefined;
  /** Full-text search across title, tags, and node labels */
  search: (query: string) => Whiteboard[];
  /** Filter by one or more tags */
  filterByTags: (tags: string[]) => Whiteboard[];
  /** Filter by authorId */
  filterByAuthor: (authorId: string) => Whiteboard[];
  /** Filter by date range (Unix ms) */
  filterByDateRange: (from: number, to: number) => Whiteboard[];
  /** Sort helpers */
  sortByDate: (order?: "asc" | "desc") => Whiteboard[];
  sortByTitle: (order?: "asc" | "desc") => Whiteboard[];
}