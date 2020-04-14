export default (diff) => {
  const formatDiff = (diffItems) => {
    const lines = diffItems.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          state,
          value,
          hasInnerChanges,
          children,
        } = propertyDiff();
        if (hasInnerChanges) {
          return {
            ...acc,
            [property]: {
              state,
              value,
              hasInnerChanges,
              children: formatDiff(children),
            },
          };
        }
        return {
          ...acc,
          [property]: {
            state,
            value,
          },
        };
      },
      {},
    );
    return lines;
  };
  const lines = formatDiff(diff);
  const result = JSON.stringify(lines, null, 2);
  return result;
};
