import { NotImplementedException } from '@nestjs/common';
import {
  ArrayContains,
  FindManyOptions,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * find options but some props accepts string format that parsed internally into the correct format
 * for example { where: "age>30,name='john'" }
 */
export interface IQuery<Entity = any>
  extends Omit<FindManyOptions<Entity>, 'where' | 'relations'> {
  where?: FindManyOptions['where'] | string;
  relations?: FindManyOptions['relations'] | string;
}

// todo: add pipes, example: `update(@Param('id', ParseUUIDPipe) id: string, body){}`
export class CrudTypeOrmService<Entity extends ObjectLiteral> {
  constructor(
    // todo: inject repo using Entity
    // @InjectRepository(Dto) private repo: Repository<Entity>,
    protected repo: Repository<Entity>,
  ) {}

  /**
   * create a TypeORM Query object
   * @param query
   * @param primaryKey the primary key value, for "*One" operations
   * @param primaryKeyName the primary key field name, default: "id"
   */
  // todo: enforce the return type
  // todo: `T extends FindOneOptions | FindManyOptions | ...`
  createQuery<Entity>(
    query?: IQuery<Entity>,
    primaryKeyValue?: string | number,
    primaryKeyName = 'id', // FindManyOptions already extends FindOneOptions
  ): FindManyOptions<Entity> {
    query = {
      ...query,
      // for "one" operations, include deleted records by default
      withDeleted: primaryKeyValue
        ? query?.withDeleted !== false
        : query?.withDeleted,
      // todo: nested relations "users.profiles"
      // todo: relation fields "users:name,email"
      relations: this.toArray(query?.relations),
      select: this.toArray(query?.select),
      order: this.toObject(query?.order, 'ASC'),
    };

    if (query.where) {
      // convert query.where to object
      if (typeof query.where === 'string') {
        // eslint-disable-next-line unicorn/no-lonely-if
        if (
          // json format
          query.where.startsWith('{') ||
          // query.where can be a string, i.e. "primaryKey"
          // if its format is not `key:value, key2` keep it string
          // if it is a single text value, consider it as primaryKey value
          // matches: `a:1, b:2, c` and `a,b` but not `id`
          /(.+:.+(,.+)?)|(.+,.+)/.test(query.where)
        ) {
          query.where = this.toObject(query.where);
        }
      }

      // todo: if isObject()
      if (typeof query.where !== 'string' && !Array.isArray(query.where)) {
        Object.keys(query.where!).map((key) => {
          // @ts-ignore
          let value = query.where[key];
          if (Array.isArray(value)) {
            // check if the array column contains the value
            // todo: use the entity to check if the field type is an array
            // @ts-ignore
            query.where[key] = ArrayContains(value.map((el) => el?.trim()));
          } else if (typeof value === 'string') {
            value = value?.trim();

            // if the value starts with ">", consider it as a raw sql statement
            // convert `{key: value}` to `{key: Raw(field=>value)}`
            // to enable sql syntax and find operations
            // such as: `Like '%test%'`
            // todo: check for sql injection of the user's input
            // todo: if it includes a find operation such as `Like` (can be a part of the value)
            // example `{key: "> {field} > 0"}`
            if (value?.startsWith?.('>')) {
              // @ts-ignore
              query.where[key] = Raw((field: string) =>
                `${value.slice(1)}`.replaceAll(/{field}/g, field),
              );
            }
          }
        });

        // add primaryKey to the condition
        if (primaryKeyValue && primaryKeyName) {
          query.where = {
            [primaryKeyName]: primaryKeyValue,
            ...query.where,
          };
        }
      }
    } else if (primaryKeyValue) {
      query.where = { [primaryKeyName]: primaryKeyValue };
    }

    return <FindManyOptions<Entity>>query;
  }

  // todo: rename to getOneById() or getOneBy${primaryParam}
  // todo: route.paramKey{name, type:String|Number}
  // todo: types
  // todo: parse query params, and add type CrudOptions.QueryParams
  getOne(id: any, query?: any, req?: Request) {
    return this.repo.findOne(this.createQuery(query, id));
  }

  // todo: handle operations, example: `{where: {email: "like %john%"} }`
  getMany(query?: any, req?: Request) {
    return this.repo
      .findAndCount(this.createQuery(query))
      .then((res) => ({ data: res[0], count: res[1] }));
  }

  /**
   * get records by a relation field
   * @param field the relationship field name
   * @param value
   * @param query
   * @param primaryKeyName
   * @param req
   * @returns
   * @example
   *  if the table posts has a relation with users,
   *  we can get all posts by the user by `getManyByRelation("user", 1)`
   */
  getManyByRelation(
    field: string,
    value: any,
    query?: any,
    primaryKeyName = 'id',
    req?: Request,
  ) {
    return this.getMany(
      {
        where: { [field]: { [primaryKeyName]: value }, ...query?.where },
        ...query,
      },
      req,
    );
  }

  post(body: DeepPartial<Entity>, query?: any, req?: Request) {
    // .save() automatically saves the manyToMany relations if cascade=true
    // or this.repo.insert(body).then((res) => (Array.isArray(body) ? res?.raw : res?.raw[0]))
    return this.repo.save(body);
  }

  /**
   * update a record by its primary key
   */
  patchOne(
    // todo: add type opts.model
    body: DeepPartial<Entity>,
    primaryKey: string | number | { [key: string]: any },
    req?: Request,
  ) {
    return this.getOne(primaryKey).then((res) => {
      if (!res?.id) throw `not found`;
      // .save() automatically modifies the ManyToMany relations
      // but requires fetching the items to be modified to add the id of each item
      // otherwise it will create a new item if it doesn't have an id
      return this.repo.save({ ...body, id: res.id });
    });
  }

  patchMany(body: DeepPartial<Entity>, query?: any, req?: Request) {
    return this.repo
      .find(query)
      .then((res) => res.map((el) => ({ ...body, id: el.id })))
      .then((res) => this.repo.save(res));

    // .update() doesn't save ManyToMany relation automatically
    // but .save() doesn't have where condition (each item has to specify id)
    // and has no limit option (it relies on the number of the items being updated)
    // use .save() see patchOne(), it meeds merging body[] with existing ids of the items to be updated
    // or create a route to save (insert or update) items `POST /save`

    // return this.repo
    //   .update(query.where, body)
    //   .then((res) => ({ affected: res.affected }));
  }

  putOne() {
    console.log('putOne', arguments);
    throw new NotImplementedException();
  }

  putMany() {
    console.log('putMany', arguments);
    throw new NotImplementedException();
  }

  deleteOne(
    primaryKeyOrCondition: string | number | { [key: string]: any },
    query: any = {},
    req?: Request,
  ) {
    query.where = ['string', 'number'].includes(typeof primaryKeyOrCondition)
      ? primaryKeyOrCondition
      : { ...query.where, ...(<{ [key: string]: any }>primaryKeyOrCondition) };
    return this.deleteMany(query, req);
  }

  deleteMany(query?: any, req?: Request) {
    // todo: softDelete() vs softRemove()
    return (
      query.softDelete === false
        ? this.repo.delete(query.where || {})
        : this.repo.softDelete(query.where || {})
    ).then((res) => ({ affected: res?.affected }));
  }

  /**
   * delete all data using `TRUNCATE` instead of `DELETE`
   */
  // todo: add a route to clear (truncate) the data
  clear() {
    return this.repo.clear();
  }

  /**
   * convert delimited string int array items and remove empty items
   * @example 'a,b,c' => ['a', 'b', 'c']
   */
  toArray(value?: any, delimiter = ',') {
    return typeof value === 'string'
      ? value
          ?.split?.(delimiter)
          // remove empty elements
          ?.filter((el) => el && el.trim() !== '')
      : value;
  }

  /**
   * convert JSON string or delimited string into a plain object
   * @example `{"a": 1}` => `{a: 1}`
   * @example `a:1, b:2, c` => `{a: 1, b: 2, c: defaultValue}`
   */
  toObject(value?: any, defaultValue: any = true) {
    if (!value) return;
    if (typeof value !== 'string') return value;
    // todo: if isObject(value) return value

    try {
      return JSON.parse(value);
    } catch {
      return value?.split?.(',')?.reduce?.(
        (acc, el) => {
          let [key, value = defaultValue] = el.split(':');
          return { ...acc, [key.trim()]: value.trim() };
        },
        <{ [key: string]: any }>{},
      );
    }
  }
}
