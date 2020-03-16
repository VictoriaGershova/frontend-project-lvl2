import path from 'path';
import fs from 'fs';
import gendiff from '../src';

const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

let expected;

beforeAll(async () => {
  expected = await fs.readFileSync(getFixturePath('result.txt'), 'utf-8').trim();
});

test('Exceptions', () => {
  const correct = getFixturePath('second.json');
  expect(() => gendiff()).toThrow();
  expect(() => gendiff('../nonexistent.json', correct)).toThrow();
  expect(() => getFileData('../src', correct)).toThrow();
});

test('diff', async () => {
  const firstFilePath = getFixturePath('first.json');
  const secondFilePath = getFixturePath('second.json');
  const actual = await gendiff(firstFilePath, secondFilePath);
  expect(actual).toEqual(expected);
});
