import { GameSettingsOptionType } from '$constants/misc';
import { IValidationErrors } from '$utils/validation';

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

export interface ISelectOption {
  label: string,
  value: string,
}

export interface IUIControllerRange {
  min: number,
  max: number,
  step: number,
}

export interface IUIControllerCheckbox {
  isChecked: boolean,
}

export interface IUIControllerSelect {
  selectOptions: ISelectOption[],
}

export interface IUIControllerTextField {
  placeholder?: string,
  isFocus?: boolean,
  isSelect?: boolean,
  isRequied?: boolean,
}

export interface IUIElementParams {
  id: string,
  className?: string,
  parentClassname?: string,
  label?: string,
  name?: string,
  value?: string|number,
  multiparameters?: string,
  optionType?: GameSettingsOptionType,
  isDisabled?: boolean,
  parent?: string,
  description?: string,
  maxLength?: number,
  validationErrors?: IValidationErrors,
}

export interface IUIElementProps<E> extends IUIElementParams{
  onChange: (event: React.ChangeEvent<E>) => void,
  onBlur?: (event: React.FocusEvent<E>) => void,
}

export type IMessageType = 'error'|'warning'|'info'|'success';

export interface IMessage {
  type: IMessageType,
  text: string,
}

export interface IUserMessage extends IMessage {
  id: string,
}

export interface ILocationState {
  isFromMainPage?: boolean,
  isGameSettingsParametersChanged?: boolean,
}

interface IIniLine {
  text: string,
  comment: string,
  lineType: number,
  key?: string,
  value?: string,
}

interface IIniSection {
  lines: IIniLine[],
  name: string,
  getValue: (key: string) => string,
  setValue: (key: string, value: string|number) => void,
  getLine: (key: string) => IIniLine,
}

interface IGlobals{
  lines: IIniLine[],
}

export interface IIniObj {
  globals: IGlobals,
  lineBreak: string,
  sections: IIniSection[],
  stringify: () => string,
  getSection: (name: string) => IIniSection,
  addSection: (name: string) => IIniSection,
}

export interface IXmlObj {
  [key: string]: any,
}

export interface IGetDataFromFilesResult {
  [key: string]: IIniObj|IXmlObj,
}

export interface IModOrganizerINIData {
  profileName: string,
  version: number,
}
