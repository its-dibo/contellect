import { UpdateResponseDto } from '#dto/update-response.dto';
import { InitCrudOptions } from '#types/crud.types';
// todo: add opts.maxTake to limit ?take=

/**
 * the default options for \@Crud()
 */
export const defaultOptions: Partial<InitCrudOptions> = {
  routes: [
    {
      httpMethod: 'GET',
      // todo: `retrieve a single ${entity.name || "record"}`
      summary: 'retrieve a single record',
    },
    {
      httpMethod: 'GET',
      many: true,
      summary: 'retrieve multiple records',
      description:
        'see <a href="https://orkhan.gitbook.io/typeorm/docs/find-options" target="_blank">TypeOrm find options</a>',
    },
    {
      httpMethod: 'POST',
      summary: 'create a single or multiple records',
    },
    {
      httpMethod: 'PATCH',
      summary: 'update a single record by primary key',
      responseModel: UpdateResponseDto,
    },
    {
      httpMethod: 'PATCH',
      summary: 'update multiple records',
      many: true,
      responseModel: UpdateResponseDto,
    },
    {
      httpMethod: 'PUT',
      summary: 'replace a single record',
      responseModel: UpdateResponseDto,
    },
    {
      httpMethod: 'PUT',
      summary: 'replace multiple records',
      many: true,
      responseModel: UpdateResponseDto,
    },
    {
      httpMethod: 'DELETE',
      summary: 'delete a record by primary key',
      responseModel: UpdateResponseDto,
    },
    {
      httpMethod: 'DELETE',
      summary: 'delete multiple records',
      many: true,
      responseModel: UpdateResponseDto,
    },
    // todo: add update multiple records
  ],
  // query params should be similar to typeOrm methods, such as findOne({relations, withDeleted, ...})
  // so query params should be ?relations&withDeleted
  // https://orkhan.gitbook.io/typeorm/docs/find-options
  queryParams: [
    {
      name: 'take',
      description: 'limit resource count.',
      example: 50,
      many: true,
      httpMethods: ['GET', 'DELETE', 'PATCH', 'PUT'],
    },
    {
      name: 'skip',
      description: 'skip rows.',
      example: 2,
      many: true,
      httpMethods: ['GET', 'DELETE', 'PATCH', 'PUT'],
    },
    {
      name: 'select',
      description: `Selects resource fields.`,
      example: ['name', 'email'],
      required: false,
      httpMethods: ['GET'],
    },
    {
      name: 'relations',
      description: 'add joined relational objects, supports nested relations',
      example: ['user.profile:name,age'],
      httpMethods: ['GET'],
    },
    {
      name: 'where',
      description:
        'add where condition. to use sql statement, start the value with `>`.\n to search in an array column, put the value in an array. see <a href="https://orkhan.gitbook.io/typeorm/docs/find-options#advanced-options" target="_blank">see advanced options</a>',
      example: { name: 'john', email: ">Like '%john%'" },
      many: true,
      httpMethods: ['GET', 'PATCH', 'PUT', 'DELETE'],
    },
    {
      name: 'order',
      // or 'name,id:DESC'
      example: { name: 'ASC', id: 'DESC' },
      many: true,
      httpMethods: ['GET', 'PATCH', 'PUT', 'DELETE'],
    },
    {
      name: 'cache',
      description: 'Enables or disables query result caching',
      type: 'boolean',
      httpMethods: ['GET'],
    },
    {
      name: 'withDeleted',
      // todo:"default:${route.many ? 'false' : 'true'}"
      description: `include soft deleted records`,
      type: 'boolean',
      httpMethods: ['GET'],
    },
    {
      name: 'softDelete',
      description:
        'whether to perform a soft or hard delete, the default is true',
      type: 'boolean',
      httpMethods: ['DELETE'],
    },
    {
      name: 'lock',
      description: 'Enables locking mechanism for query',
      httpMethods: ['GET'],
      many: false,
      example: { mode: 'optimistic', version: 1 },
    },
  ],
  serviceName: 'service',
  primaryKey: 'id',
};
