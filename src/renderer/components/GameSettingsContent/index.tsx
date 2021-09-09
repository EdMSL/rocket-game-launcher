import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IGameSettingsItemParameter, IGameSettingsParameter, IGameSettingsRootState,
} from '$types/gameSettings';
import {
  generateSelectOptions, getOptionName, getParametersForOptionsGenerate,
} from '$utils/data';
import { GameSettingParameterControllerType, GameSettingParameterType } from '$constants/misc';
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
export const GameSettingsContent: React.FunctionComponent<IProps> = ({
  usedFiles,
  settingGroups,
  gameOptions,
}) => {
  const { settingGroup: locationSettingGroup } = useParams<{ [key: string]: string, }>();

  const [hintParameter, setHintParameter] = useState<string>('');

  const onParameterInputChange = useCallback(() => {}, []);
  const onParameterRangeButtonClick = useCallback(() => {}, []);
  const onParameterHover = useCallback(() => {}, []);
  const onParameterLeave = useCallback(() => {}, []);

  const getValue = useCallback((
    parameter: IGameSettingsParameter|IGameSettingsItemParameter,
    iniName: string,
  ) => {
    const { value } = gameOptions[iniName][getOptionName(parameter)];

    return value;
  }, [gameOptions]);

  return (
    <React.Fragment>
      {
        Object.keys(usedFiles)
          .map(
            (fileName) => getParametersForOptionsGenerate(
              usedFiles[fileName],
              settingGroups,
              locationSettingGroup,
            ).map(
              (parameter) => {
                if (parameter.parameterType === GameSettingParameterType.RELATED) {
                  return (
                    <div
                      key={parameter.label}
                      className={styles['game-settings-content__item']}
                    >
                      <div className={styles['game-settings-content__label']}>
                        <span>{parameter.label}</span>
                        {/* <SettingsHintBlock
                          id={parameter.label}
                          description={parameter.description}
                          hintParameter={hintParameter}
                          iniName={iniName}
                          parametersNames={parameter.parameters.map((param) => param.name)}
                          onHover={() => onParameterHover(parameter.label)}
                          onLeave={onParameterLeave}
                        /> */}
                      </div>
                      <div className={styles['game-settings-content__subblock']}>
                        {
                      parameter.items!.map((relatedParameter) => {
                        if (relatedParameter.controllerType === 'select') {
                          return (
                            <Select
                              key={relatedParameter.id}
                              className={styles['game-settings-content__item']}
                              id={relatedParameter.id}
                              name={getOptionName(parameter)}
                              parent={fileName}
                              group={relatedParameter.iniGroup}
                              value={(gameOptions[fileName] && getValue(relatedParameter, fileName)) || 'None'}
                              isDisabled={!gameOptions[fileName]}
                              optionsArr={generateSelectOptions(relatedParameter.options!)}
                              onChange={onParameterInputChange}
                            />
                          );
                        }

                        return undefined;
                      })
                    }
                      </div>
                    </div>
                  );
                }
                if (parameter.parameterType === GameSettingParameterType.DEFAULT) {
                  if (parameter.controllerType === GameSettingParameterControllerType.RANGE) {
                    return (
                      <Range
                        key={parameter.id}
                        className={styles['game-settings-content__item']}
                        id={parameter.id}
                        name={getOptionName(parameter)}
                        group={parameter.iniGroup}
                        parent={fileName}
                        value={(gameOptions[fileName] && getValue(parameter, fileName)) || '0'}
                        min={parameter.min!.toString()}
                        max={parameter.max!.toString()}
                        step={parameter.step!.toString()}
                        isDisabled={!gameOptions[fileName]}
                        label={parameter.label!}
                        description={fileName}
                        valueText={getValue(parameter, fileName).toString()}
                        hintParameter={hintParameter}
                        onChange={onParameterInputChange}
                        onButtonClick={onParameterRangeButtonClick}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
                      />
                    );
                  }

                  if (parameter.controllerType === GameSettingParameterControllerType.CHECKBOX) {
                    return (
                      <Checkbox
                        key={parameter.id}
                        className={styles['game-settings-content__item']}
                        classNameCheckbox={styles.setting__checkbox}
                        id={parameter.id}
                        name={getOptionName(parameter)}
                        parent={fileName}
                        group={parameter.iniGroup}
                        label={parameter.label!}
                        description={fileName}
                        isChecked={(gameOptions[fileName] && Boolean(+getValue(parameter, fileName))) || false}
                        isDisabled={!gameOptions[fileName]}
                        hintParameter={hintParameter}
                        onChange={onParameterInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
                      />
                    );
                  }

                  if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                    return (
                      <Select
                        key={parameter.id}
                        className={styles['game-settings-content__item']}
                        id={parameter.id}
                        name={getOptionName(parameter)}
                        parent={fileName}
                        group={parameter.iniGroup}
                        label={parameter.label}
                        description={fileName}
                        value={(gameOptions[fileName] && getValue(parameter, fileName)) || 'None'}
                        isDisabled={!gameOptions[fileName]}
                        hintParameter={hintParameter}
                        optionsArr={generateSelectOptions(parameter.options!)}
                        onChange={onParameterInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
                      />
                    );
                  }
                }

                return undefined;
              },
            ),
          )

      }
    </React.Fragment>
  );
};
