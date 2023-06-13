import { execSync } from 'child_process';

export function stopLocalRegistry() {
  if (global.localRegistryProcess) {
    global.localRegistryProcess.kill();
  }
  if (global.localRegistryPort) {
    execSync(
      `npm config delete //localhost:${global.localRegistryPort}/:_authToken`
    );
  }
}

export default stopLocalRegistry;
