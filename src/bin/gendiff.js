#!/usr/bin/env node
import commander from 'commander';
import genDiff, { getVersion } from '..';

const progVersion = getVersion();
const program = new commander.Command();
program
  .version(progVersion)
  .description('Compares two configuration files and shows a difference')
  .option('-f, --format [type]', 'output format')
  .arguments('<firstConfig> <secondConfig>')
  .action(
    (firstConfig, secondConfig) => console.log(genDiff(firstConfig, secondConfig)),
  )
  .parse(process.argv);
