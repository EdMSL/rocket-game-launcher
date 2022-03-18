export type IError = 'error';
export type ISuccess = 'success';

export interface ILauncherResolution {
  width: number,
  height: number,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

export type IUnwrap<T> = T extends (...args: any[]) => Promise<infer U> ? U : T;
export type IUnwrapSync<T> = T extends (...args: any[]) => infer U ? U : T;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface IActionHandler<S, T> {
  (state: S, payload: UnsafeReturnType<T>): S,
}

export interface IValidationErrors {
  [id: string]: string[],
}

export interface IUIElementParams {
  id: string,
  className?: string,
  parentClassname?: string,
  label?: string,
  name?: string,
  value?: string|number,
  multiparameters?: string,
  isDisabled?: boolean,
  parent?: string,
  description?: string,
  maxLength?: number,
  validationErrors?: string[],
}

export interface IUIElementProps<E> extends IUIElementParams{
  onChange: (event: React.ChangeEvent<E>) => void,
}

export interface ILocationState {
  isFromMainPage?: boolean,
}
