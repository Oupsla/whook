import initConfigCommand from './config';
import YError from 'yerror';

describe('configCommand', () => {
  const CONFIGS = {
    MYSQL: {
      auth: {
        username: 'root',
      },
      version: '2.1.1',
    },
  };
  const promptArgs = jest.fn();
  const log = jest.fn();

  beforeEach(() => {
    promptArgs.mockReset();
    log.mockReset();
  });

  it('should work with no query at all', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'MYSQL',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });
    const result = await configCommand();

    expect({
      result,
      promptArgsCalls: promptArgs.mock.calls,
      logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
    }).toMatchSnapshot();
  });

  it('should work with one value', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'MYSQL',
      query: 'auth.username',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });
    const result = await configCommand();

    expect({
      result,
      promptArgsCalls: promptArgs.mock.calls,
      logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
    }).toMatchSnapshot();
  });

  it('should work with several values', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'MYSQL',
      query: 'auth.*',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });
    const result = await configCommand();

    expect({
      result,
      promptArgsCalls: promptArgs.mock.calls,
      logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
    }).toMatchSnapshot();
  });

  it('should work with an unexisting config but a default value', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'DOES_NOT_EXIST',
      default: 'v8',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });
    const result = await configCommand();

    expect({
      result,
      promptArgsCalls: promptArgs.mock.calls,
      logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
    }).toMatchSnapshot();
  });

  it('should work with no result but a default value', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'MYSQL',
      query: 'nothing_here',
      default: 'v8',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });
    const result = await configCommand();

    expect({
      result,
      promptArgsCalls: promptArgs.mock.calls,
      logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
    }).toMatchSnapshot();
  });

  it('should fail with unexisting config name', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'DOES_NOT_EXIST',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });

    try {
      await configCommand();
      throw new YError('E_UNEXPEXTED_SUCCESS');
    } catch (err) {
      expect({
        errorCode: err.code,
        errorParams: err.params,
        promptArgsCalls: promptArgs.mock.calls,
        logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
      }).toMatchSnapshot();
    }
  });

  it('should fail with no result', async () => {
    promptArgs.mockResolvedValueOnce({
      _: ['config'],
      name: 'MYSQL',
      query: 'nothing_here',
    });

    const configCommand = await initConfigCommand({
      log,
      CONFIGS,
      promptArgs,
    });

    try {
      await configCommand();
      throw new YError('E_UNEXPEXTED_SUCCESS');
    } catch (err) {
      expect({
        errorCode: err.code,
        errorParams: err.params,
        promptArgsCalls: promptArgs.mock.calls,
        logCalls: log.mock.calls.filter(args => 'stack' !== args[0]),
      }).toMatchSnapshot();
    }
  });
});
