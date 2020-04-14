import listFormater from './list';
import jsonFormater from './json';
import plainFormater from './plain';

const formatters = {
  list: listFormater,
  plain: plainFormater,
  json: jsonFormater,
};

export default (diff, format) => formatters[format](diff);
