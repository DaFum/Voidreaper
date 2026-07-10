export function createSocketService(chipDefinitions) {
  const chips = new Map(chipDefinitions.map(chip => [chip.id, chip]));
  return {
    insert(item, socketIndex, chipId) {
      if (!chips.has(chipId)) throw new Error(`Unknown socket chip: ${chipId}`);
      if (!item.sockets?.[socketIndex]) throw new Error(`Item has no socket ${socketIndex}`);
      if (item.sockets[socketIndex].chipId) throw new Error(`Socket ${socketIndex} is occupied`);
      item.sockets[socketIndex] = { ...item.sockets[socketIndex], chipId, insertedAt: new Date().toISOString() };
      return item;
    },
    remove(item, socketIndex, { safe = false } = {}) {
      const socket = item.sockets?.[socketIndex];
      if (!socket?.chipId) return null;
      const chipId = socket.chipId;
      item.sockets[socketIndex] = { ...socket, chipId: null };
      return { chipId, destroyed: !safe };
    },
    destroy(item, socketIndex) {
      const result = this.remove(item, socketIndex);
      return Boolean(result);
    },
    behaviors(item) { return (item.sockets ?? []).filter(socket => socket.chipId).map(socket => chips.get(socket.chipId)); }
  };
}
