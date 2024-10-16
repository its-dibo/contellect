import { InitRoute } from '../types/crud.types';

/**
 * add route options to the method
 * @example
 * ```
 * \@CrudRoute({httpMethod: 'GET', many: true})
 *  getAllUsers(){
 *   return this.service.getAllUsers();
 *  }
 * ```
 */
export function CrudRoute<T>(route?: InitRoute): MethodDecorator {
  return (target: Object, prop: string | symbol) => {
    Reflect.defineMetadata('crudRoute', route, target, prop);
  };
}
