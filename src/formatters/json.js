export default (diff, sortDiff) => {
  const formatDiff = (diffItems) => {
    const sorted = sortDiff(diffItems);
    const lines = sorted.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          value,
          children,
          state,
        } = propertyDiff();
        if (children) {
          return { ...acc, [property]: formatDiff(children) };
        }
        return { ...acc, [property]: { state, value } };
      },
      {},
    );
    return lines;
  };
  const lines = formatDiff(diff);
  const result = JSON.stringify(lines, null, 2);
  return result;
};
