import Ajv from 'ajv';
import YError from 'yerror';
import { WhookCommandDefinitionArguments } from '../services/promptArgs';
import { WhookCommandArgs } from '../services/args';

// TODO: Add ajv human readable error builder
export function readArgs(
  schema: WhookCommandDefinitionArguments,
  args: WhookCommandArgs,
): WhookCommandArgs {
  const ajv = new Ajv({
    coerceTypes: true,
    useDefaults: true,
    strictDefaults: true,
    strictKeywords: true,
  });
  const validator = ajv.compile(schema);

  const {
    _: [, ...listedArgs],
    ...namedArgs
  } = args;
  const cleanedArgs = {
    ...namedArgs,
    ...(listedArgs.length ? { _: listedArgs } : {}),
  } as WhookCommandArgs;

  validator(cleanedArgs);

  if ((validator.errors || []).length) {
    throw new YError('E_BAD_ARGS', validator.errors);
  }

  return cleanedArgs;
}
