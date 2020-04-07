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

export default (diff, sortProp) => {
  const formatDiffItems = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
    const sorted = sortProp(diffItems);
    const lines = sorted.reduce(
      (acc, diffItem) => {
        const {
          property,
          value,
          subproperties,
          state,
        } = diffItem;
        const linesTemplate = (stateSign, contentLines, hasSubproperties) => ([
          `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${contentLines[0]}`,
          ...(hasSubproperties
            ? contentLines.filter((line, index) => index !== 0)
            : contentLines
              .filter((line, index) => index !== 0)
              .map((line) => `${' '.repeat(margeWidth)}${line}`)),
        ]);
        if (state === 'added') {
          return [...acc, ...linesTemplate('+', stringifyValue(value).split('\n'), false)];
        }
        if (state === 'deleted') {
          return [...acc, ...linesTemplate('-', stringifyValue(value).split('\n'), false)];
        }
        if (state === 'unchanged') {
          return [...acc, ...linesTemplate(' ', stringifyValue(value).split('\n'), false)];
        }
        if (subproperties.length > 0) {
          return [...acc, ...linesTemplate(' ', formatDiffItems(subproperties, depth + 1), true)];
        }
        return [
          ...acc,
          ...linesTemplate('-', stringifyValue(value.oldValue).split('\n'), false),
          ...linesTemplate('+', stringifyValue(value.newValue).split('\n'), false),
        ];
      },
      [],
    );
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = formatDiffItems(diff);
  return lines.join('\n');
};
