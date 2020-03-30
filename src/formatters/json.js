export default (diff) => {
  const serializeDiffItems = (diffItems) => {
    const properties = Object.keys(diffItems);
    const lines = properties
      .sort((propertyA, propertyB) => {
        if (propertyA < propertyB) {
          return -1;
        }
        if (propertyA > propertyB) {
          return 1;
        }
        return 0;
      })
      .reduce(
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
