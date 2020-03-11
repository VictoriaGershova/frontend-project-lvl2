import commander from 'commander';
import pjson from '../package.json';

export default () => {
  const progVersion = pjson.version;
  const program = new commander.Command();
  program
    .version(progVersion)
    .description('Compares two configuration files and shows a difference')
    .option('-f, --format [type]', 'output format')
    .arguments('<firstConfig> <secondConfig>')
    .action(() => {})
    .parse(process.argv);
};
