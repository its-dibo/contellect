export function removeUndefinedValues(obj: { [key: string]: any }) {
  Object.keys(obj).map((key) => {
    if (obj[key] === undefined) delete obj[key];
  });
  return obj;
}

export function shallowMerge(
  ...objects: Array<{ [key: string]: any } | undefined>
) {
  return objects
    .map((el) => removeUndefinedValues({ ...el }))
    .reduce((acc, el) => ({ ...acc, ...el }), {});
}

// todo: export from @engineers/javascript
export function isEmpty(value: any): boolean {
  return (
    // value = undefined || null || "" || 0
    (!value && value !== false) ||
    (typeof value === 'string' && value.trim() === '') ||
    // note that in js: `[]!=[]` and `{}!={}` because every one is a new instance.
    // don't use `if(value==[])return true`
    (Array.isArray(value) && value.length === 0) ||
    (objectType(value) === 'object' && Object.keys(value).length === 0)
  );
}

// todo: export from @engineers/javascript
export function objectType(object: any): string {
  return Object.prototype.toString
    .call(object)
    .replace('[object ', '')
    .replace(']', '')
    .toLowerCase();
}
