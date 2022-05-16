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
import { AppChannel, LauncherButtonAction } from '$constants/misc';
import { getIsPathWithVariableCorrect, IValidationData } from '$utils/check';

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
    validationData: IValidationData,
    parent?: string
  ) => void,
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
      `${currentPathVariable}\\${target.value}`,
      name || id,
      { errors: { [id]: ['incorrect path'] }, isForAdd: !isCorrectPath },
      parent,
    );
  }, [currentPathVariable, selectorType, name, id, parent, extensions, onChange]);

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
          { errors: { [id]: ['not available path', 'incorrect path'] }, isForAdd: !isCorrectPath },
          parent,
        );
      } catch (error) {
        setCurrentPathVariable(availablePathVariables[0]);
        setCurrentPathValue(pathStr);

        onChange(
          `${availablePathVariables[0]}\\${pathStr}`,
          name || id,
          { errors: { [id]: ['not available path'] }, isForAdd: true },
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
      { errors: {}, isForAdd: false },
      parent,
    );
  }, [currentPathValue, id, name, parent, onChange]);

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
          disabled={isDisabled || (validationErrors && validationErrors[id]?.includes('not available path'))}
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
