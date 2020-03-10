import commander from 'commander';
import pjson from '../package.json';

export default () => {
  const progVersion = pjson.version;
  const program = new commander.Command();
  program
    .version(progVersion)
    .description('Compares two configuration files and shows a difference')
    .parse(process.argv);
};
