export default (diff) => {
  const formatDiff = (diffItems) => {
    const lines = diffItems.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          value,
          hasInnerChange,
          children,
          state,
        } = propertyDiff();
        if (hasInnerChange) {
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
