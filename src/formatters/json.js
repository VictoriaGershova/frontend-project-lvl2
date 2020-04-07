export default (diff, sortProp) => {
  const serializeDiffItems = (diffItems) => {
    const sorted = sortProp(diffItems);
    const lines = sorted.reduce(
      (acc, diffItem) => {
        const {
          property,
          value,
          subproperties,
          state,
        } = diffItem;
        if (subproperties.length > 0) {
          return { ...acc, [property]: serializeDiffItems(subproperties) };
        }
        return { ...acc, [property]: { state, value } };
      },
      {},
    );
    return lines;
  };
  const lines = serializeDiffItems(diff);
  const result = JSON.stringify(lines, null, 2);
  return result;
};
