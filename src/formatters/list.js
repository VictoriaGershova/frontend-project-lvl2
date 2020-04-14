import { flatten } from 'lodash';
import states from '../state';

const tabLength = 4;

const stringifyObject = (obj, depth) => {
  const marge = tabLength * (depth + 1);
  const lines = Object.keys(obj)
    .map((key) => {
      const v = obj[key];
      const strV = v instanceof Object ? stringifyObject(v, depth + 1) : v;
      return `${' '.repeat(marge)}${key}: ${strV}`;
    });
  return ['{', ...lines, `${' '.repeat(depth * tabLength)}}`].join('\n');
};

const stringifyValue = (value, depth) => {
  if (value instanceof Object) {
    return stringifyObject(value, depth);
  }
  return `${value}`;
};

export default (diff) => {
  const formatDiff = (diffItems, depth = 0) => {
    const margeWidth = tabLength * (depth + 1); // space length before property including operation
    const lines = diffItems.map((propertyDiff) => {
      const {
        property,
        state,
        value,
        hasInnerChanges,
        children,
      } = propertyDiff();
      const linesTemplate = (stateSign, contentLines) => ([
        `${`${stateSign} `.padStart(margeWidth, ' ')}${property}: ${contentLines[0]}`,
        ...contentLines.filter((line, index) => index !== 0),
      ]);
      switch (state) {
        case states.added:
          return linesTemplate('+', stringifyValue(value, depth + 1).split('\n'));
        case states.deleted:
          return linesTemplate('-', stringifyValue(value, depth + 1).split('\n'));
        case states.changed:
          if (hasInnerChanges) {
            return linesTemplate(' ', formatDiff(children, depth + 1));
          }
          return [
            ...linesTemplate('-', stringifyValue(value.oldValue, depth + 1).split('\n')),
            ...linesTemplate('+', stringifyValue(value.newValue, depth + 1).split('\n')),
          ];
        default:
          return linesTemplate(' ', stringifyValue(value, depth + 1).split('\n'));
      }
    });
    return ['{', ...flatten(lines), `${' '.repeat(tabLength * depth)}}`];
  };
  const lines = formatDiff(diff);
  return lines.join('\n');
};
