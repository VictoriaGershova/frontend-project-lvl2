import commander from 'commander';

export default () => {
  const program = new commander.Command();
  program
    .version('0.0.1')
    .description('Compares two configuration files and shows a difference')
    .parse(process.argv);
};
