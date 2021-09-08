import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IGameSettingsItemParameter, IGameSettingsParameter, IGameSettingsRootState,
} from '$types/gameSettings';
import { getOptionName, getParametersForOptionsGenerate } from '$utils/data';
import { SettingParameterControllerType } from '$constants/misc';
import { Checkbox } from '$components/UI/Checkbox';
import { Select } from '$components/UI/Select';
import { Range } from '$components/UI/Range';

interface IProps {
  usedFiles: IGameSettingsRootState['usedFiles'],
  settingGroups: IGameSettingsRootState['settingGroups'],
  gameOptions: IGameSettingsRootState['gameOptions'],
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
 * @param usedFiles Объект с параметрами из `state`, на основе которых сгенерированы
 * опции игровых настроек.
 * @param settingGroups Массив доступных групп игровых настроек из `state`.
 * @param gameOptions Объект с обработанными опциями из `state`, готовыми для вывода.
*/
export const GameSettingsBlock: React.FunctionComponent<IProps> = ({
  usedFiles,
  settingGroups,
  gameOptions,
}) => {
  const { currentSettingGroup } = useParams<{ [key: string]: string, }>();

  const [hintParameter, setHintParameter] = useState<string>('');

  const onParameterInputChange = useCallback(() => {}, []);
  const onParameterRangeButtonClick = useCallback(() => {}, []);
  const onParameterHover = useCallback(() => {}, []);
  const onParameterLeave = useCallback(() => {}, []);

  const getValue = useCallback((
    parameter: IGameSettingsParameter|IGameSettingsItemParameter,
    iniName: string,
  ) => {
    // let value;

    // if (gameOptions[iniName]) {
    //   if (parameter.iniGroup) {
    //     value = gameOptions[iniName][`${parameter.iniGroup}/${parameter.name}`].value;
    //   } else {
    //     value = gameOptions[iniName][parameter.name!].value;
    //   }

    //   return value;
    // }

    const { value } = gameOptions[iniName][getOptionName(parameter)];

    return value;
  }, [gameOptions]);

  return (
    <React.Fragment>
      {
        /* eslint-disable */
        Object.keys(usedFiles).map(
          (fileName) => {
            console.log(getParametersForOptionsGenerate(
            usedFiles,
            fileName,
            settingGroups,
            currentSettingGroup,
          ))
            return getParametersForOptionsGenerate(
            usedFiles,
            fileName,
            settingGroups,
            currentSettingGroup,
          ).map(
            (parameter) => {
              // console.log(getOptionName(parameter));
              // if (parameter.controllerType === SettingParameterControllerType.RANGE) {
              //   return (
              //     <Range
              //       key={parameter.id}
              //       className={classNames('setting', styles.setting__item)}
              //       id={parameter.id}
              //       name={getOptionName(parameter)}
              //       group={parameter.iniGroup}
              //       parent={fileName}
              //       value={(gameOptions[fileName] && getValue(parameter, fileName)) || '0'}
              //       min={parameter.min!.toString()}
              //       max={parameter.max!.toString()}
              //       step={parameter.step!.toString()}
              //       isDisabled={!gameOptions[fileName]}
              //       label={parameter.label!}
              //       description={fileName}
              //       valueText={getValue(parameter, fileName).toString()}
              //       hintParameter={hintParameter}
              //       onChange={onParameterInputChange}
              //       onButtonClick={onParameterRangeButtonClick}
              //       onHover={onParameterHover}
              //       onLeave={onParameterLeave}
              //     />
              //   );
              // }

              // if (parameter.controllerType === SettingParameterControllerType.CHECKBOX) {
              //   return (
              //     <Checkbox
              //       key={parameter.iniGroup ? `${parameter.iniGroup}/${parameter.name}` : parameter.name}
              //       className={classNames('setting', styles.setting__item)}
              //       classNameCheckbox={styles.setting__checkbox}
              //       id={(parameter.iniGroup && `${parameter.iniGroup}-${parameter.name}`) || parameter.name}
              //       name={parameter.iniGroup ? `${parameter.iniGroup}/${parameter.name}` : parameter.name}
              //       parent={iniName}
              //       group={parameter.iniGroup}
              //       label={parameter.label!}
              //       description={parameter.description}
              //       isChecked={(gameOptions[iniName] && Boolean(+getValue(parameter, iniName))) || false}
              //       isDisabled={!gameSettings[iniName]}
              //       hintParameter={hintParameter}
              //       onChange={onParameterInputChange}
              //       onHover={onParameterHover}
              //       onLeave={onParameterLeave}
              //     />
              //   );
              // }

              // if (parameter.controllerType === SettingParameterControllerType.SELECT) {
              //   return (
              //     <Select
              //       key={parameter.iniGroup ? `${parameter.iniGroup}/${parameter.name}` : parameter.name}
              //       className={classNames('setting', styles.setting__item, styles.setting__select)}
              //       id={(parameter.iniGroup && `${parameter.iniGroup}-${parameter.name}`) || parameter.name}
              //       name={parameter.iniGroup ? `${parameter.iniGroup}/${parameter.name}` : parameter.name}
              //       parent={iniName}
              //       group={parameter.iniGroup}
              //       label={parameter.label}
              //       description={parameter.description}
              //       value={(gameSettings[iniName] && getValue(parameter, iniName)) || 'None'}
              //       isDisabled={!gameSettings[iniName]}
              //       hintParameter={hintParameter}
              //       optionsArr={generateSelectOptions(parameter.options)}
              //       onChange={onParameterInputChange}
              //       onHover={onParameterHover}
              //       onLeave={onParameterLeave}
              //     />
              //   );
              // }

              return undefined;
            },
          )
        },
        )
      }
    </React.Fragment>
  );
};

