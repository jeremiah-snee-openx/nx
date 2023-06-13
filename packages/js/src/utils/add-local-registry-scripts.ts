import { ProjectConfiguration, readJson, type Tree } from '@nx/devkit';

const startLocalRegistryScript = (localRegistryTarget: string) => `
/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js';

export default async () => {
  // local registry target to run
  const localRegistryTarget = '${localRegistryTarget}';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  await startLocalRegistry({ localRegistryTarget, storage, verbose: false });
};

`;

const stopLocalRegistryScript = `
/**
 * This script stops the local registry for e2e testing purposes.
 * It is meant to be called in jest's globalTeardown.
 */
import { stopLocalRegistry } from '@nx/js';

export default () => {
  stopLocalRegistry();
};
`;

export function addLocalRegistryScripts(tree: Tree) {
  const startLocalRegistryPath = 'tools/scripts/start-local-registry.ts';
  const stopLocalRegistryPath = 'tools/scripts/stop-local-registry.ts';

  const projectConfiguration: ProjectConfiguration = readJson(
    tree,
    'project.json'
  );
  const localRegistryTarget = `${projectConfiguration.name}:local-registry`;
  if (!tree.exists(startLocalRegistryPath)) {
    tree.write(
      startLocalRegistryPath,
      startLocalRegistryScript(localRegistryTarget)
    );
  }
  if (!tree.exists(stopLocalRegistryPath)) {
    tree.write(stopLocalRegistryPath, stopLocalRegistryScript);
  }

  return { startLocalRegistryPath, stopLocalRegistryPath };
}
