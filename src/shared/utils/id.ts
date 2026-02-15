export type UuidFactory = () => string | null;

export function createIdGenerator(uuidFactory?: UuidFactory) {
  let counter = 0;

  return (prefix = "id"): string => {
    const uuid = uuidFactory?.();
    if (uuid) {
      return uuid;
    }

    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
  };
}

const browserUuidFactory: UuidFactory = () => {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    return null;
  }
  return crypto.randomUUID();
};

export const generateId = createIdGenerator(browserUuidFactory);
