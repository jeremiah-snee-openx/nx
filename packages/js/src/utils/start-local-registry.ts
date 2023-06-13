import { execSync, fork } from 'child_process';

/**
 * This function is used to start a local registry for testing purposes.
 * @param localRegistryTarget the target to run to start the local registry e.g. workspace:local-registry
 * @param storage the storage location for the local registry
 * @param verbose whether to log verbose output
 */
export async function startLocalRegistry({
  localRegistryTarget,
  storage,
  verbose,
}: {
  localRegistryTarget: string;
  storage?: string;
  verbose?: boolean;
}) {
  if (!localRegistryTarget) {
    throw new Error(`localRegistryTarget is required`);
  }
  global.localRegistryProcess = await new Promise((resolve, reject) => {
    const childProcess = fork(
      require.resolve('nx'),
      [
        ...`run ${localRegistryTarget} --location none --clear true`.split(' '),
        ...(storage ? [`--storage`, storage] : []),
      ],
      { stdio: ['inherit', 'pipe', 'inherit', 'ipc'] }
    );

    const listener = (data) => {
      if (verbose) {
        process.stdout.write(data);
      }
      if (data.toString().includes('http://localhost:')) {
        global.port = parseInt(
          data.toString().match(/localhost:(?<port>\d+)/)?.groups?.port
        );
        console.log('Local registry started on port ' + global.port);

        const registry = `http://localhost:${global.port}`;
        process.env.npm_config_registry = registry;
        process.env.YARN_REGISTRY = registry;
        execSync(
          `npm config set //localhost:${global.port}/:_authToken "secretVerdaccioToken"`
        );
        console.log('Set npm and yarn config registry to ' + registry);

        resolve(childProcess);
        childProcess?.stdout?.off('data', listener);
      }
    };
    childProcess?.stdout?.on('data', listener);
    childProcess.on('error', (err) => {
      console.log('local registry error', err);
      reject(err);
    });
    childProcess.on('exit', (code) => {
      console.log('local registry exit', code);
      reject(code);
    });
  });
}

export default startLocalRegistry;
