import { flatten } from 'lodash';
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
    const lines = sorted.map((propertyDiff) => {
      const {
        property,
        value,
        hasInnerChange,
        children,
        state,
      } = propertyDiff();
      const linesTemplate = (stateSign, contentLines, marge) => ([
        `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${contentLines[0]}`,
        ...contentLines
          .filter((line, index) => index !== 0)
          .map((line) => `${' '.repeat(marge)}${line}`),
      ]);
      switch (state) {
        case states.added:
          return linesTemplate('+', stringifyValue(value).split('\n'), margeWidth);
        case states.deleted:
          return linesTemplate('-', stringifyValue(value).split('\n'), margeWidth);
        case states.changed:
          if (hasInnerChange) {
            return linesTemplate(' ', formatDiff(children, depth + 1), 0);
          }
          return [
            ...linesTemplate('-', stringifyValue(value.oldValue).split('\n'), margeWidth),
            ...linesTemplate('+', stringifyValue(value.newValue).split('\n'), margeWidth),
          ];
        default:
          return linesTemplate(' ', stringifyValue(value).split('\n'), margeWidth);
      }
    });
    return ['{', ...flatten(lines), `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = formatDiff(diff);
  return lines.join('\n');
};
