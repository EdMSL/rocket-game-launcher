import React, {
  useCallback, useEffect, useState,
} from 'react';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import { IUIElementParams } from '$types/common';
import { HintItem } from '$components/HintItem';
import { Button } from '../Button';
import { ISelectOption } from '../Select';
import { getVariableAndValueFromPath } from '$utils/data';
import { IPathVariables } from '$constants/paths';
import { checkIsPathIsNotOutsideValidFolder, replaceRootDirByPathVariable } from '$utils/strings';
import { AppChannel, LauncherButtonAction } from '$constants/misc';
import { getIsPathWithVariableCorrect, IValidationData } from '$utils/check';

interface IProps extends IUIElementParams {
  options: ISelectOption[],
  pathVariables: IPathVariables,
  extensions?: string[],
  isSelectDisabled?: boolean,
  selectorType?: string,
  isGameDocuments?: boolean,
  onChange: (
    value: string,
    id: string,
    validationData: IValidationData,
    parent?: string
  ) => void,
}

export const PathSelector: React.FC<IProps> = ({
  id,
  label,
  name,
  value,
  options,
  pathVariables,
  extensions,
  className = '',
  parentClassname,
  description,
  parent,
  multiparameters,
  validationErrors,
  isDisabled = false,
  isSelectDisabled = options.length <= 1,
  selectorType = LauncherButtonAction.OPEN,
  isGameDocuments = true,
  onChange,
}) => {
  const [pathVariable, pathValue] = getVariableAndValueFromPath(String(value));
  const availablePathVariables = Object.values(options).map((option) => option.value);

  const [currentPathVariable, setCurrentPathVariable] = useState<string>(pathVariable);
  const [currentPathValue, setCurrentPathValue] = useState<string>(pathValue);

  useEffect(() => {
    if (currentPathValue !== pathValue) {
      setCurrentPathValue(pathValue);
    }
    if (currentPathVariable !== pathVariable) {
      setCurrentPathValue(pathVariable);
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
      `${currentPathVariable}\\${target.value}`,
      id,
      { errors: { [id]: ['incorrect path'] }, isForAdd: !isCorrectPath },
      parent,
    );
  }, [currentPathVariable, selectorType, id, parent, extensions, onChange]);

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
          id,
          { errors: { [id]: ['not available path', 'incorrect path'] }, isForAdd: !isCorrectPath },
          parent,
        );
      } catch (error) {
        setCurrentPathVariable(availablePathVariables[0]);
        setCurrentPathValue(pathStr);

        onChange(
          `${availablePathVariables[0]}\\${pathStr}`,
          id,
          { errors: { [id]: ['not available path'] }, isForAdd: true },
          parent,
        );
      }
    }
  }, [id,
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
    onChange(`${target.value}\\${currentPathValue}`, id, { errors: {}, isForAdd: false }, parent);
  }, [currentPathValue, id, parent, onChange]);

  return (
    <div className={classNames(
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
        <select
          className="path-selector__select"
          onChange={onPathVariableSelectChange}
          value={currentPathVariable}
          disabled={isSelectDisabled}
        >
          {
          options.map((option) => (
            <option
              key={`option-${option.label}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        }
        </select>
        <input
          className={classNames(
            'path-selector__input',
            validationErrors && validationErrors.length > 0 && 'path-selector__input--error',
          )}
          id={id}
          name={name}
          type="text"
          value={currentPathValue}
          data-parent={parent}
          data-multiparameters={multiparameters}
          disabled={isDisabled || validationErrors?.includes('not available path')}
          onChange={onPatchTextFieldChange}
        />
        <Button
          className="path-selector__input-btn"
          onClick={onSelectPatchBtnClick}
          isDisabled={isDisabled}
        >
          Выбрать путь
        </Button>
      </div>
    </div>
  );
};
