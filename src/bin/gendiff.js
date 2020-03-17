#!/usr/bin/env node
import commander from 'commander';
import genDiff from '..';
import pjson from '../../package.json';

const progVersion = pjson.version;
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
