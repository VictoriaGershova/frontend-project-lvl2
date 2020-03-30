import yaml from 'js-yaml';
import ini from 'ini';

const isNumber = (value) => (/^-{0,1}\d+$/.test(value) || /^\d+\.\d+$/.test(value));

const parserFunctions = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: (data) => {
    const parsedData = ini.parse(data);
    const iter = (items) => Object.entries(items).reduce(
      (acc, [key, value]) => {
        if (value instanceof Object) {
          return { ...acc, [key]: iter(value) };
        }
        if (isNumber(value)) {
          return { ...acc, [key]: Number(value) };
        }
        return { ...acc, [key]: value };
      },
      {},
    );
    return iter(parsedData);
  },
};

export default (extName) => (data) => parserFunctions[extName](data);
