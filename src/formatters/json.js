export default (diff) => {
  const formatDiff = (diffItems) => {
    const lines = diffItems.map((propertyDiff) => {
      const {
        property,
        state,
        value,
        hasInnerChanges,
        children,
      } = propertyDiff;
      if (hasInnerChanges) {
        return {
          property,
          state,
          value,
          hasInnerChanges,
          children: formatDiff(children),
        };
      }
      return {
        property,
        state,
        value,
      };
    });
    return lines;
  };
  const lines = { properties: formatDiff(diff) };
  const result = JSON.stringify(lines, null, 2);
  return result;
};
