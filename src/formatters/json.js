export default (diff, sortProp) => {
  const serializeDiffItems = (diffItems) => {
    const properties = sortProp(Object.keys(diffItems));
    const lines = properties.reduce(
      (acc, property) => {
        const {
          value,
          children,
          operation,
        } = diffItems[property];
        if (Object.keys(children).length > 0) {
          return { ...acc, [property]: serializeDiffItems(children) };
        }
        return { ...acc, [property]: { operation, value } };
      },
      {},
    );
    return lines;
  };
  const lines = serializeDiffItems(diff);
  const result = JSON.stringify(lines, null, 2);
  return result;
};
