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
  const serializeDiffItems = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
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
          let newLines;
          const {
            value,
            children,
            operation,
          } = diffItems[property];
          const linesTemplate = (operationSign, contentLines, hasChildren) => ([
            `${`${operationSign} `.padStart(margeWidth, ' ')}${property}: ${contentLines[0]}`,
            ...(hasChildren
              ? contentLines.filter((line, index) => index !== 0)
              : contentLines
                .filter((line, index) => index !== 0)
                .map((line) => `${' '.repeat(margeWidth)}${line}`)),
          ]);
          if (operation === 'insert') {
            newLines = linesTemplate('+', stringifyValue(value).split('\n'), false);
          }
          if (operation === 'delete') {
            newLines = linesTemplate('-', stringifyValue(value).split('\n'), false);
          }
          if (operation === 'unchanged') {
            newLines = linesTemplate(' ', stringifyValue(value).split('\n'), false);
          }
          if (Object.keys(children).length > 0) {
            newLines = linesTemplate(' ', serializeDiffItems(children, depth + 1), true);
          } else if (operation === 'update') {
            newLines = [
              ...linesTemplate('-', stringifyValue(value.oldValue).split('\n'), false),
              ...linesTemplate('+', stringifyValue(value.newValue).split('\n'), false),
            ];
          }
          return [
            ...acc,
            ...newLines,
          ];
        },
        [],
      );
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = serializeDiffItems(diff);
  return lines.join('\n');
};
