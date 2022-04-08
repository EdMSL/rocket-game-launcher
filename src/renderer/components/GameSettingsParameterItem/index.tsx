import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Select } from '$components/UI/Select';
import { IValidationErrors } from '$types/common';
import { generateSelectOptions } from '$utils/data';
import { GameSettingsOptionType } from '$constants/misc';
import { IGameSettingsParameter } from '$types/gameSettings';

interface IProps {
  parameter: IGameSettingsParameter,
  validationErrors: IValidationErrors,
  onValidation: (errors: IValidationErrors) => void,
}

export const GameSettingsParameterItem: React.FC<IProps> = ({
  parameter,
  validationErrors,
}) => {
  const onOptionTypeChange = useCallback(() => {}, []);

  return (
    <React.Fragment>
      <Select
        options={generateSelectOptions(GameSettingsOptionType)}
        id={`optionType_${parameter.id}`}
        value={parameter.optionType}
        onChange={onOptionTypeChange}
      />
    </React.Fragment>
  );
};
