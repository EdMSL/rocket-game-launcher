import React, {
  useCallback, useEffect, useState,
} from 'react';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import {
  ISelectOption, IUIControllerTextField, IUIElementParams,
} from '$types/common';
import { HintItem } from '$components/HintItem';
import { Button } from '../Button';
import { IPathVariables } from '$constants/paths';
import {
  checkIsPathIsNotOutsideValidFolder, replaceRootDirByPathVariable, getVariableAndValueFromPath,
} from '$utils/strings';
import {
  AppChannel, LauncherButtonAction, PathVariableName,
} from '$constants/misc';
import { getIsPathWithVariableCorrect } from '$utils/check';
import {
  getValidationCauses, IValidationError, ValidationErrorCause,
} from '$utils/validation';
import { openFolder } from '$utils/process';
import { getPathToFile, normalizePath } from '$utils/files';

interface IProps extends IUIElementParams, IUIControllerTextField {
  id: string,
  selectPathVariables: ISelectOption[],
  pathVariables: IPathVariables,
  extensions?: string[],
  isSelectDisabled?: boolean,
  selectorType?: string,
  isGameDocuments?: boolean,
  onChange: (
    value: string,
    name: string,
    validationData: IValidationError[],
    parent?: string
  ) => void,
  onOpenPathError: (errorText: string) => void,
}

export const PathSelector: React.FC<IProps> = ({
  id,
  label,
  name,
  value,
  selectPathVariables,
  pathVariables,
  extensions,
  className = '',
  parentClassname,
  description,
  parent,
  multiparameters,
  validationErrors,
  isDisabled = false,
  isSelectDisabled = selectPathVariables.length <= 1,
  selectorType = LauncherButtonAction.OPEN,
  isGameDocuments = true,
  onChange,
  onOpenPathError,
}) => {
  const [pathVariable, pathValue] = getVariableAndValueFromPath(String(value));
  const availablePathVariables = Object.values(selectPathVariables).map((option) => option.value);

  const [currentPathVariable, setCurrentPathVariable] = useState<string>(pathVariable);
  const [currentPathValue, setCurrentPathValue] = useState<string>(pathValue);

  useEffect(() => {
    if (currentPathValue !== pathValue) {
      setCurrentPathValue(pathValue);
    }
    if (currentPathVariable !== pathVariable) {
      setCurrentPathVariable(pathVariable);
    }
  }, [currentPathValue, currentPathVariable, pathValue, pathVariable, selectorType, value]);

  const getPathFromPathSelector = useCallback(async (
  ): Promise<string> => {
    const pathStr = await ipcRenderer.invoke(
      AppChannel.GET_PATH_BY_PATH_SELECTOR,
      selectorType,
      currentPathValue
        ? `${pathVariables[currentPathVariable]}\\${currentPathValue}`
        : pathVariables[currentPathVariable],
      extensions,
    );

    return pathStr;
  }, [pathVariables,
    extensions,
    selectorType,
    currentPathVariable,
    currentPathValue]);

  const onPatchTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const isCorrectPath = getIsPathWithVariableCorrect(
      target.value,
      selectorType,
      extensions,
    );

    setCurrentPathValue(target.value);

    onChange(
      `${currentPathVariable}${target.value !== '' ? `\\${target.value}` : ''}`,
      name || id,
      [{
        id,
        error: {
          cause: ValidationErrorCause.PATH,
          text: 'Указан некорректный путь',
        },
        isForAdd: !isCorrectPath,
      }],
      parent,
    );
  }, [currentPathVariable, selectorType, name, id, parent, extensions, onChange]);

  const onOpenFolderBtnClick = useCallback(() => {
    openFolder(
      getPathToFile(
        String(value),
        pathVariables,
        undefined,
        false,
        selectPathVariables
          .map((currentOption) => currentOption.value)
          .includes(PathVariableName.DOCUMENTS),
      ),
      onOpenPathError,
      selectorType === LauncherButtonAction.RUN,
    );
  }, [value, selectorType, pathVariables, selectPathVariables, onOpenPathError]);

  const onSelectPatchBtnClick = useCallback(async () => {
    let pathStr = await getPathFromPathSelector();
    let isCorrectPath;

    if (pathStr !== '') {
      try {
        checkIsPathIsNotOutsideValidFolder(pathStr, pathVariables, isGameDocuments);

        pathStr = replaceRootDirByPathVariable(pathStr, availablePathVariables, pathVariables);
        const [variablePath, valuePath] = getVariableAndValueFromPath(pathStr);

        setCurrentPathVariable(variablePath);
        setCurrentPathValue(valuePath);

        isCorrectPath = getIsPathWithVariableCorrect(
          pathStr,
          selectorType,
          extensions,
        );

        onChange(
          `${variablePath}\\${valuePath}`,
          name || id,
          [
            {
              id,
              error: {
                cause: ValidationErrorCause.NOT_AVAILABLE,
                text: 'Указан недопустимый путь',
              },
              isForAdd: !isCorrectPath,
            },
            {
              id,
              error: {
                cause: ValidationErrorCause.PATH,
                text: 'Указан некорректный путь',
              },
              isForAdd: !isCorrectPath,
            },
          ],
          parent,
        );
      } catch (error) {
        setCurrentPathVariable(availablePathVariables[0]);
        setCurrentPathValue(pathStr);

        onChange(
          `${availablePathVariables[0]}\\${pathStr}`,
          name || id,
          [{
            id,
            error: {
              cause: ValidationErrorCause.NOT_AVAILABLE,
              text: 'Указан недопустимый путь',
            },
            isForAdd: true,
          }],
          parent,
        );
      }
    }
  }, [id,
    name,
    parent,
    pathVariables,
    isGameDocuments,
    availablePathVariables,
    selectorType,
    extensions,
    onChange,
    getPathFromPathSelector]);

  const onPathVariableSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrentPathVariable(target.value);
    onChange(
      `${target.value}\\${currentPathValue}`,
      name || id,
      [],
      parent,
    );
  }, [currentPathValue, id, name, parent, onChange]);

  const getIsDisabled = useCallback(() => isDisabled
    || (
      validationErrors
      && validationErrors[id]
      && getValidationCauses(validationErrors[id]).includes(ValidationErrorCause.NOT_AVAILABLE)
    )
    || !pathVariable,
  [id, isDisabled, validationErrors, pathVariable]);

  const onInputBlur = useCallback(() => {
    onChange(
      normalizePath(
        `${currentPathVariable}${currentPathValue !== '' ? `\\${currentPathValue}` : ''}`,
      ),
      name || id,
      [],
      parent,
    );
  }, [id,
    name,
    parent,
    currentPathVariable,
    currentPathValue,
    onChange]);

  return (
    <div className={classNames(
      'ui__container',
      'path-selector__container',
      parentClassname && `${parentClassname}-path-selector__container`,
      className,
    )}
    >
      <label
        className="path-selector__label"
        htmlFor={id}
      >
        <span>{label}</span>
        {
          description && <HintItem description={description} />
        }
      </label>
      <div className="path-selector__input-block">
        {
          pathVariable && (
          <select
            className="path-selector__select"
            name={name}
            value={currentPathVariable}
            disabled={isSelectDisabled}
            onChange={onPathVariableSelectChange}
          >
            {
            selectPathVariables.map((option) => (
              <option
                key={`option-${option.label}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))
        }
          </select>
          )
        }
        <input
          className={classNames(
            'path-selector__input',
            validationErrors && validationErrors[id]?.length > 0 && 'path-selector__input--error',
          )}
          id={id}
          name={name}
          type="text"
          value={currentPathValue}
          data-parent={parent}
          data-multiparameters={multiparameters}
          disabled={getIsDisabled()}
          onChange={onPatchTextFieldChange}
          onBlur={onInputBlur}
        />
        {
          validationErrors && validationErrors[id]?.some((currentError) => currentError.text) && (
            <ul className="input-error__block">
              {
                validationErrors[id]
                  .filter((currentError) => currentError.text)
                  .map((currentError) => <li key={`${id}${currentError.cause}`}>{currentError.text}</li>)
              }
            </ul>
          )
        }
        <Button
          className="path-selector__input-btn path-selector__input-btn--open"
          title="Открыть в проводнике"
          isDisabled={isDisabled}
          onClick={onOpenFolderBtnClick}
        >
          {/* eslint-disable */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          {/* eslint-enable */}
        </Button>
        <Button
          className="path-selector__input-btn path-selector__input-btn--choose"
          title="Выбрать путь"
          isDisabled={isDisabled}
          onClick={onSelectPatchBtnClick}
        >
          Выбрать путь
        </Button>
      </div>
    </div>
  );
};
