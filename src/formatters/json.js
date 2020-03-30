const tabLength = 4;

const stringifyValue = (value) => {
  const stringifyObject = (obj, depth = 0) => {
    const lines = Object.keys(obj)
      .map((key) => {
        const v = obj[key];
        const strV = v instanceof Object ? stringifyObject(v, depth + 1) : v;
        return `${' '.repeat(tabLength * (depth + 1))}${key}: ${strV}`;
      });
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`].join('\n');
  };
  if (value instanceof Object) {
    return stringifyObject(value);
  }
  return `${value}`;
};

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
