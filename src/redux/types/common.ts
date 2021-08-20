export type IError = 'error';
export type ISuccess = 'success';

export interface ILauncherResolution {
  width: number,
  height: number,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UnsafeReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

export type IUnwrap<T> = T extends (...args: any[]) => Promise<infer U> ? U : T;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface IAction<T> {
  (payload: T): UnsafeReturnType<T>,
}

export interface IActionHandler<S, T> {
  (state: S, payload: UnsafeReturnType<T>): S,
}

