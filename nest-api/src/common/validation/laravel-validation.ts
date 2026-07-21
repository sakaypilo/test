import { ValidationError } from 'class-validator';

export function toLaravelValidationErrors(errors: ValidationError[]) {
  const result: Record<string, string[]> = {};

  const visit = (err: ValidationError, path: string = '') => {
    const field = path ? `${path}.${err.property}` : err.property;

    if (err.constraints) {
      result[field] = Object.values(err.constraints);
    }

    if (err.children && err.children.length > 0) {
      for (const child of err.children) {
        visit(child, field);
      }
    }
  };

  for (const err of errors) {
    visit(err);
  }

  return result;
}
