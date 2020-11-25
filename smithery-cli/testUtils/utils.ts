import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import concat from 'concat-stream';

export function createProcess(processPath: string, args: string[] = [], env: string | null = null): ChildProcessWithoutNullStreams {
  args = [processPath].concat(args);
  if (env === null) {
    return spawn('node', args);
  } else {
    const environmentOptions = Object.assign({ NODE_ENV: 'test' }, { NODE_ENV: env });
    return spawn('node', args, { env: environmentOptions });
  }
}

export function execute(processPath: string, args: string[] = [], opts: { [key: string]: any } = {}): Promise<string> {
  const { env = null } = opts;
  const childProcess = createProcess(processPath, args, env);
  childProcess.stdin.setDefaultEncoding('utf-8');

  return new Promise((resolve, reject) => {
    childProcess.stderr.once('data', err => {
      reject(err.toString());
    });

    childProcess.on('error', reject);

    childProcess.stdout.pipe(
      concat(result => {
        resolve(result.toString());
      })
    );
  });
}