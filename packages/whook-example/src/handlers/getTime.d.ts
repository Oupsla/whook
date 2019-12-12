import { WhookDefinition, WhookResponse } from '@whook/whook';
import { TimeService } from 'common-services';
export declare const definition: WhookDefinition;
declare const _default: import('knifecycle').HandlerInitializer<
  {
    time: TimeService;
  },
  [],
  WhookResponse<
    number,
    {
      [name: string]: string;
    },
    any
  >,
  import('knifecycle').Parameters,
  import('knifecycle').Handler<
    import('knifecycle').Parameters,
    [],
    WhookResponse<
      number,
      {
        [name: string]: string;
      },
      any
    >
  >
>;
export default _default;
