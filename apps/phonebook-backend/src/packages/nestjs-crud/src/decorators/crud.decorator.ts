import { CrudFactory } from '#crud.factory';
import { CrudOptions, InitCrudOptions } from '#types/crud.types';

/**
 * generate crud methods
 * @param options
 * @returns
 */
export function Crud(
  options?: InitCrudOptions | ((defaultOptions: CrudOptions) => CrudOptions),
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    new CrudFactory(target, options);
  };
}
