import path from 'path';
import fs from 'fs';
import gendiff from '../src';

const formats = [
  'json',
  'yml',
  'ini',
];

const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

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
  const expected = await fs.readFileSync(getFixturePath('result.txt'), 'utf-8').trim();
  expect(actual).toEqual(expected);
});

test('tree', async () => {
  const filePath1 = getFixturePath('firsttree.json');
  const filePath2 = getFixturePath('secondtree.json');
  const actual = await gendiff(filePath1, filePath2);
  const expected = await fs.readFileSync(getFixturePath('treeResult.txt'), 'utf-8').trim();
  expect(actual).toEqual(expected);
});
