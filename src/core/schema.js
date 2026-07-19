export function assertDefinition(definition, requiredKeys = [], kind = "content") {
  const errors = [];
  if (!definition || typeof definition !== "object") {
    errors.push("definition must be an object");
  } else {
    if (!definition.id || typeof definition.id !== "string") errors.push("id must be a non-empty string");
    if (!definition.name || typeof definition.name !== "string") errors.push("name must be a non-empty string");
    for (const key of requiredKeys) {
      if (definition[key] === undefined || definition[key] === null) errors.push(`missing ${key}`);
    }
  }
  if (errors.length) {
    const id = definition?.id ?? "<unknown>";
    const error = new Error(`Invalid ${kind} ${id}: ${errors.join(", ")}`);
    console.error(error.message);
    throw error;
  }
  return definition;
}

function validateReferences(definitions, registries, referenceFields) {
  const errors = [];
  for (const definition of definitions) {
    for (const [field, registryName] of Object.entries(referenceFields)) {
      const values = Array.isArray(definition[field]) ? definition[field] : [definition[field]].filter(Boolean);
      for (const value of values) {
        const id = typeof value === "string" ? value : value.id;
        if (id && !registries[registryName]?.has(id)) errors.push(`${definition.id}.${field} -> ${id}`);
      }
    }
  }
  return errors;
}
