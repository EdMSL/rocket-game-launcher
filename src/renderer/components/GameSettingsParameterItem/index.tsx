import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { IValidationErrors } from '$types/common';
import { generateSelectOptions } from '$utils/data';
import { GameSettingsOptionType } from '$constants/misc';
import { IGameSettingsParameter } from '$types/gameSettings';
import { Button } from '$components/UI/Button';

interface IProps {
  parameter: IGameSettingsParameter,
  validationErrors: IValidationErrors,
  onValidation: (errors: IValidationErrors) => void,
  deleteParameter: (id: string) => void,
}

export const GameSettingsParameterItem: React.FC<IProps> = ({
  parameter,
  validationErrors,
  deleteParameter,
}) => {
  const onOptionTypeChange = useCallback(() => {}, []);

  const onDeleteFileBtnClick = useCallback(() => {
    deleteParameter(parameter.id);
  }, [parameter.id, deleteParameter]);

  return (
    <React.Fragment>
      <Select
        options={generateSelectOptions(GameSettingsOptionType)}
        id={`optionType_${parameter.id}`}
        value={parameter.optionType}
        onChange={onOptionTypeChange}
      />
      <Button
        className={classNames(
          'main-btn',
          'developer-screen__spoiler-button',
        )}
        onClick={onDeleteFileBtnClick}
      >
        Удалить
      </Button>
    </React.Fragment>
  );
};
