import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * use with FormlyAutoCompleteMatComponent to filter data
 * @param values \
 *  the initial values list.\
 *  an array of strings or objects.\
 *  if an object provided the query is matched against the specified valueProp.
 * @param strategy \
 *  filter: filter the values that the query contains them and doesn't exist in the selectedItems[] \
 *  sort: display the matched values first
 * @return a function that takes the user-input value and filters the values according to it
 */
export default function autoComplete(
  values: Array<string | { [key: string]: any }>,
  strategy: 'filter' | 'sort' = 'filter',
  labelProp = 'label',
  valueProp = 'value',
) {
  return (query?: string, field?: FormlyFieldConfig) => {
    if (!query || query.trim() === '') return values;
    let selectedItems = field?.formControl?.value?.map(
      (el: string | { [key: string]: any }) =>
        (typeof el === 'string' ? el : el[labelProp])?.toLowerCase(),
    );

    if (strategy === 'filter')
      return values.filter((el) => {
        let item = (typeof el === 'string' ? el : el[labelProp])?.toLowerCase(),
          value = typeof el === 'string' ? el.toLowerCase() : el[valueProp];
        return (
          item.includes(query.toLowerCase()) && !selectedItems?.includes(value)
        );
      });
    return values.reduce(
      (acc: Array<string | { [key: string]: any }>, el) =>
        (typeof el === 'string' ? el : el[labelProp])
          .toLowerCase()
          .includes(query.toLowerCase())
          ? [el, ...acc]
          : [...acc, el],
      [],
    );
  };
}
