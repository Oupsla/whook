import pkgDir from 'pkg-dir';
import { name, options, autoService } from 'knifecycle';
import YError from 'yerror';
import { noop } from '../libs/utils';
import { LogService } from 'common-services';

/* Architecture Note #8: Project dir

Whook needs to know the directory of the project under
 which he is running. It then uses this service to
 automatically detect it.
*/

export default options(
  { singleton: true },
  name('PROJECT_DIR', autoService(initProjectDir)),
);

/**
 * Auto detect the Whook PROJECT_DIR
 * @param  {Object}   services
 * The services PROJECT_DIR depends on
 * @param  {Object}   services.PWD
 * The process working directory
 * @param  {Object}   [log=noop]
 * An optional logging service
 * @return {Promise<string>}
 * A promise of a number representing the actual port.
 */
async function initProjectDir({
  PWD,
  log = noop,
}: {
  PWD: string;
  log?: LogService;
}): Promise<string> {
  const projectDir = await pkgDir(PWD);

  if (projectDir) {
    log('warning', '✔ - Found the project dir:', projectDir);
    return projectDir;
  }

  log('error', '🚫 - Could not detect the whook project dir.');
  throw new YError('E_NO_PROJECT_DIR', PWD);
}
