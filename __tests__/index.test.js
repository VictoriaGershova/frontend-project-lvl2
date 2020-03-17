import path from 'path';
import fs from 'fs';
import gendiff from '../src';

const formats = [
  'json',
  'yml',
  'ini',
];

const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

let expected;

beforeAll(async () => {
  expected = await fs.readFileSync(getFixturePath('result.txt'), 'utf-8').trim();
});

test('exceptions', () => {
  const correct = getFixturePath('second.json');
  expect(() => gendiff()).toThrow();
  expect(() => gendiff('../nonexistent.json', correct)).toThrow();
  expect(() => gendiff('../src', correct)).toThrow();
});

test.each(formats)('%s', async (format) => {
  const filePath1 = getFixturePath(`first.${format}`);
  const filePath2 = getFixturePath(`second.${format}`);
  const actual = await gendiff(filePath1, filePath2);
  expect(actual).toEqual(expected);
});
