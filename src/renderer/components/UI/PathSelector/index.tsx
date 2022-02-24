import React, {
  useCallback, useEffect, useState,
} from 'react';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import { IUIElementParams } from '$types/gameSettings';
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { Button } from '../Button';
import { ISelectOption } from '../Select';
import { getVariableAndValueFromPath } from '$utils/data';
import { IPathVariables } from '$constants/paths';
import { checkIsPathIsNotOutsideValidFolder, replaceRootDirByPathVariable } from '$utils/strings';

interface IProps extends IUIElementParams {
  options: ISelectOption[],
  pathVariables: IPathVariables,
  extensions?: string[],
  isSelectDisabled?: boolean,
  isSelectFile?: boolean,
  isGameDocuments?: boolean,
  onChange: (value: string|undefined, id: string, parent: string) => void,
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
  currentHintId = '',
  parent = '',
  multiparameters = '',
  isDisabled = false,
  isSelectDisabled = options.length <= 1,
  isSelectFile = false,
  isGameDocuments = true,
  onChange,
  onHover,
  onLeave,
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
  }, [currentPathValue, currentPathVariable, pathValue, pathVariable]);

  const getPathFromPathSelector = useCallback(async (
  ): Promise<string> => {
    const pathStr = await ipcRenderer.invoke(
      'get path from native window',
      pathVariables,
      currentPathValue
        ? `${pathVariables[currentPathVariable]}\\${currentPathValue}`
        : pathVariables[currentPathVariable],
      isSelectFile,
      extensions,
      isGameDocuments,
    );

    return pathStr;
  }, [pathVariables,
    extensions,
    isSelectFile,
    isGameDocuments,
    currentPathVariable,
    currentPathValue]);

  const ontPatchTextFieldChange = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPathValue(target.value);
    onChange(`${currentPathVariable}\\${target.value}`, id, parent);
  }, [currentPathVariable, id, parent, onChange]);

  const onSelectPatchBtnClick = useCallback(async () => {
    let pathStr: string|undefined = await getPathFromPathSelector();

    if (pathStr) {
      try {
        checkIsPathIsNotOutsideValidFolder(pathStr, pathVariables, isGameDocuments);

        pathStr = replaceRootDirByPathVariable(pathStr, availablePathVariables, pathVariables);
        const [varr, stri] = getVariableAndValueFromPath(pathStr!);

        setCurrentPathVariable(varr);
        setCurrentPathValue(stri);
      } catch (error) {
        pathStr = undefined;
      }
    }

    onChange(pathStr, id, parent);
  }, [id,
    parent,
    pathVariables,
    isGameDocuments,
    availablePathVariables,
    onChange,
    getPathFromPathSelector]);

  const onPathVariableSelectChange = useCallback((
    { target }: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrentPathVariable(target.value);
    onChange(`${target.value}\\${currentPathValue}`, id, parent);
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
        description
        && onHover
        && onLeave
        && (
          <GameSettingsHintBlock
            id={id}
            currentHintId={currentHintId}
            description={description}
            onHover={onHover}
            onLeave={onLeave}
          />
        )
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
          className="path-selector__input"
          id={id}
          name={name}
          type="text"
          value={currentPathValue}
          data-parent={parent}
          data-multiparameters={multiparameters}
          disabled={isDisabled}
          onChange={ontPatchTextFieldChange}
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
