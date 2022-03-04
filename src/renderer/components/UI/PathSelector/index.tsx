import React, {
  useCallback, useEffect, useState,
} from 'react';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import { IUIElementParams } from '$types/gameSettings';
import { HintItem } from '$components/HintItem';
import { Button } from '../Button';
import { ISelectOption } from '../Select';
import { getVariableAndValueFromPath } from '$utils/data';
import { IPathVariables } from '$constants/paths';
import { checkIsPathIsNotOutsideValidFolder, replaceRootDirByPathVariable } from '$utils/strings';
import { AppChannel, LauncherButtonAction } from '$constants/misc';
import { getIsPathWithVariableCorrect } from '$utils/check';

interface IProps extends IUIElementParams {
  options: ISelectOption[],
  pathVariables: IPathVariables,
  extensions?: string[],
  isSelectDisabled?: boolean,
  selectorType?: string,
  isGameDocuments?: boolean,
  onChange: (
    value: string|undefined,
    isValidationError: boolean,
    id: string,
    parent: string
  ) => void,
  onHover?: (id: string) => void,
  onLeave?: () => void,
}

export const PathSelector: React.FC<IProps> = ({
  id,
  label,
  name = id,
  value,
  options,
  pathVariables,
  extensions,
  className = '',
  parentClassname = '',
  description = '',
  parent = '',
  multiparameters = '',
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
  const [isValidationError, setIsValidationError] = useState<boolean>(false);

  useEffect(() => {
    if (currentPathValue !== pathValue) {
      setCurrentPathValue(pathValue);
    }
    if (currentPathVariable !== pathVariable) {
      setCurrentPathValue(pathVariable);
    }

    setIsValidationError(!getIsPathWithVariableCorrect(
      value as string,
      selectorType,
    ));
  }, [currentPathValue, currentPathVariable, pathValue, pathVariable, selectorType, value]);

  const getPathFromPathSelector = useCallback(async (
  ): Promise<string> => {
    const pathStr = await ipcRenderer.invoke(
      AppChannel.GET_PATH_BY_PATH_SELECTOR,
      pathVariables,
      selectorType,
      currentPathValue
        ? `${pathVariables[currentPathVariable]}\\${currentPathValue}`
        : pathVariables[currentPathVariable],
      extensions,
      isGameDocuments,
    );

    return pathStr;
  }, [pathVariables,
    extensions,
    selectorType,
    isGameDocuments,
    currentPathVariable,
    currentPathValue]);

  const onPatchTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const isCorrectPath = getIsPathWithVariableCorrect(
      target.value,
      selectorType,
    );

    setIsValidationError(!isCorrectPath);

    setCurrentPathValue(target.value);
    onChange(`${currentPathVariable}\\${target.value}`, !isCorrectPath, id, parent);
  }, [currentPathVariable, id, parent, selectorType, onChange]);

  const onSelectPatchBtnClick = useCallback(async () => {
    let pathStr: string|undefined = await getPathFromPathSelector();
    let isCorrectPath;

    if (pathStr) {
      try {
        checkIsPathIsNotOutsideValidFolder(pathStr, pathVariables, isGameDocuments);

        pathStr = replaceRootDirByPathVariable(pathStr, availablePathVariables, pathVariables);
        const [variablePath, valuePath] = getVariableAndValueFromPath(pathStr!);

        setCurrentPathVariable(variablePath);
        setCurrentPathValue(valuePath);

        isCorrectPath = getIsPathWithVariableCorrect(
          pathStr,
          selectorType,
        );

        setIsValidationError(!isCorrectPath);
      } catch (error) {
        pathStr = undefined;
      }
    }

    onChange(pathStr, !isCorrectPath, id, parent);
  }, [id,
    parent,
    pathVariables,
    isGameDocuments,
    availablePathVariables,
    selectorType,
    onChange,
    getPathFromPathSelector]);

  const onPathVariableSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrentPathVariable(target.value);
    onChange(`${target.value}\\${currentPathValue}`, isValidationError, id, parent);
  }, [currentPathValue, id, parent, isValidationError, onChange]);

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
            isValidationError && 'path-selector__input--error',
          )}
          id={id}
          name={name}
          type="text"
          value={currentPathValue}
          data-parent={parent}
          data-multiparameters={multiparameters}
          disabled={isDisabled}
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
