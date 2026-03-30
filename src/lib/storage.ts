import type {
  Category,
  Collection,
  CollectionItem,
  Status,
  StatusConfig,
  StatusEntry,
  StatusOption,
} from "../types";

const STORAGE_KEY = "memento_collection";

const EMPTY_COLLECTION: Collection = {
  movies: [],
  tvshows: [],
  albums: [],
  books: [],
};

export const STATUS_CONFIG: StatusConfig = {
  movies: {
    completed: { label: "Assistido", color: "text-green" },
    in_progress: null,
    planned: { label: "Quero assistir", color: "text-gold" },
    dropped: { label: "Abandonado", color: "text-red" },
  },
  tvshows: {
    completed: { label: "Concluído", color: "text-green" },
    in_progress: { label: "Assistindo", color: "text-blue" },
    planned: { label: "Planejado", color: "text-gold" },
    dropped: { label: "Abandonado", color: "text-red" },
  },
  albums: {
    completed: { label: "Ouvido", color: "text-green" },
    in_progress: { label: "Ouvindo", color: "text-blue" },
    planned: { label: "Quero ouvir", color: "text-gold" },
    dropped: { label: "Abandonado", color: "text-red" },
  },
  books: {
    completed: { label: "Lido", color: "text-green" },
    in_progress: { label: "Lendo", color: "text-blue" },
    planned: { label: "Quero ler", color: "text-gold" },
    dropped: { label: "Abandonado", color: "text-red" },
  },
};

function getItems(collection: Collection, type: Category): CollectionItem[] {
  return collection[type] ?? [];
}

export function getStatusesFor(type: Category): StatusOption[] {
  const entries = Object.entries(STATUS_CONFIG[type] ?? {}) as [
    Status,
    StatusEntry | null,
  ][];
  return entries
    .filter((entry): entry is [Status, StatusEntry] => entry[1] !== null)
    .map(([key, val]) => ({ value: key, label: val.label, color: val.color }));
}

export function getStatusLabel(type: Category, status: Status): string {
  return STATUS_CONFIG[type]?.[status]?.label ?? status;
}

export function getStatusColor(type: Category, status: Status): string {
  return STATUS_CONFIG[type]?.[status]?.color ?? "text-text-muted";
}

export function loadCollection(): Collection {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...EMPTY_COLLECTION };
    const collection: Collection = JSON.parse(data);
    for (const type of Object.keys(collection) as Category[]) {
      collection[type] = getItems(collection, type).map(
        (item: CollectionItem) =>
          item.status === ("watching" as Status)
            ? { ...item, status: "in_progress" as Status }
            : item,
      );
    }
    return collection;
  } catch {
    return { ...EMPTY_COLLECTION };
  }
}

export function saveCollection(collection: Collection): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function addToCollection(
  collection: Collection,
  type: Category,
  item: CollectionItem,
): Collection {
  const items = getItems(collection, type);
  const exists = items.some((i) => i.id === item.id);
  if (exists) return collection;
  const defaultStatus: Status = type === "movies" ? "completed" : "planned";
  return {
    ...collection,
    [type]: [
      ...items,
      {
        ...item,
        addedAt: Date.now(),
        status: defaultStatus,
        rating: null,
        notes: "",
      },
    ],
  };
}

export function removeFromCollection(
  collection: Collection,
  type: Category,
  id: string,
): Collection {
  return {
    ...collection,
    [type]: getItems(collection, type).filter((i) => i.id !== id),
  };
}

export function updateItem(
  collection: Collection,
  type: Category,
  id: string,
  updates: Partial<Pick<CollectionItem, "status" | "rating" | "notes">>,
): Collection {
  return {
    ...collection,
    [type]: getItems(collection, type).map((i) =>
      i.id === id ? { ...i, ...updates } : i,
    ),
  };
}
