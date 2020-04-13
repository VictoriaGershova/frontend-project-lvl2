import states from '../state';

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

export default (diff, sortDiff) => {
  const formatDiff = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
    const sorted = sortDiff(diffItems);
    const lines = sorted.reduce(
      (acc, propertyDiff) => {
        const {
          property,
          value,
          children,
          state,
        } = propertyDiff();
        const linesTemplate = (stateSign, contentLines, marge) => ([
          `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${contentLines[0]}`,
          ...contentLines
            .filter((line, index) => index !== 0)
            .map((line) => `${' '.repeat(marge)}${line}`),
        ]);
        if (state === states.added) {
          return [...acc, ...linesTemplate('+', stringifyValue(value).split('\n'), margeWidth)];
        }
        if (state === states.deleted) {
          return [...acc, ...linesTemplate('-', stringifyValue(value).split('\n'), margeWidth)];
        }
        if (children) {
          return [...acc, ...linesTemplate(' ', formatDiff(children, depth + 1), 0)];
        }
        if (state === states.changed) {
          return [
            ...acc,
            ...linesTemplate('-', stringifyValue(value.oldValue).split('\n'), margeWidth),
            ...linesTemplate('+', stringifyValue(value.newValue).split('\n'), margeWidth),
          ];
        }
        return [...acc, ...linesTemplate(' ', stringifyValue(value).split('\n'), margeWidth)];
      },
      [],
    );
    return ['{', ...lines, `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = formatDiff(diff);
  return lines.join('\n');
};
