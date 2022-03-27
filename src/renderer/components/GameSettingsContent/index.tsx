import React, {
  useCallback, useState, ReactElement,
} from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars-2';

import styles from './styles.module.scss';
import {
  IGameSettingsItemParameter,
  IGameSettingsOptions,
  IGameSettingsOptionsItem,
  IGameSettingsParameter,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  generateNewGameSettingsOption,
  generateSelectOptions,
  getOptionId,
  getOptionName,
  getParametersForOptionsGenerate,
  isIGameSettingsItemParameter,
} from '$utils/data';
import {
  GameSettingParameterControllerType,
  GameSettingsOptionType,
  HTMLInputType,
  RangeButtonName,
} from '$constants/misc';
import { Checkbox } from '$components/UI/Checkbox';
import { Select } from '$components/UI/Select';
import { Range } from '$components/UI/Range';
import { HintItem } from '$components/HintItem';
import { getNumberOfDecimalPlaces, getValueFromRange } from '$utils/strings';
import { Switcher } from '$components/UI/Switcher';
import { IMainRootState } from '$types/main';

interface IProps {
  isGameSettingsLoaded: IMainRootState['isGameSettingsLoaded'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsParameters: IGameSettingsRootState['gameSettingsParameters'],
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
  onSettingOptionChange: (
    // parent: string,
    options: IGameSettingsOptions,
  ) => void,
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
 * @param gameSettingsGroups Массив доступных групп игровых настроек из `state`.
 * @param gameSettingsFiles Массив файлов с игровыми параметрами из `state`,
 * на основе которых сгенерированы опции игровых настроек.
 * @param gameSettingsParameters Массив игровых параметров из `state`.
 * @param gameSettingsOptions Объект с обработанными опциями из `state`, готовыми для вывода.
 * @param onSettingOptionChange callback функция, вызываемая при изменении значения опции
 * через контроллер.
*/
export const GameSettingsContent: React.FunctionComponent<IProps> = ({
  isGameSettingsLoaded,
  gameSettingsGroups,
  gameSettingsFiles,
  gameSettingsParameters,
  gameSettingsOptions,
  onSettingOptionChange,
}) => {
  const { settingGroup: locationSettingGroup } = useParams<{ [key: string]: string, }>();

  const onOptionRangeButtonClick = useCallback((
    btnName: string,
    parent: string,
    name: string,
    min: number,
    max: number,
    step: number,
  ) => {
    const newStep = btnName === RangeButtonName.INCREASE ? step : 0 - step;
    const currentOption = gameSettingsOptions[parent][name];

    const isOptionDefaultValueFloat = /\./g.test(currentOption.default);
    const value = isOptionDefaultValueFloat
      ? (+currentOption.value + newStep).toFixed(getNumberOfDecimalPlaces(currentOption.default))
      : (+currentOption.value + newStep).toFixed(getNumberOfDecimalPlaces(step));

    onSettingOptionChange(
      {
        [name]: generateNewGameSettingsOption(
          gameSettingsOptions[name],
          isOptionDefaultValueFloat
            ? getValueFromRange(value, min, max).toFixed(getNumberOfDecimalPlaces(value))
            : getValueFromRange(value, min, max),
        ),
      },
    );
  }, [gameSettingsOptions, onSettingOptionChange]);

  const onOptionInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>,
  ) => {
    const optionId = getOptionId(target.name, target.id);
    let value: string|number = '';
    let newGameOptions: IGameSettingsOptions = {};

    if (target.type === HTMLInputType.RANGE) {
      const optionDefaultValue = gameSettingsOptions[optionId].default;

      value = /\./g.test(optionDefaultValue)
        ? (+target.value).toFixed(getNumberOfDecimalPlaces(optionDefaultValue))
        : target.value;
    } else if (target.type === HTMLInputType.SELECT) {
      value = target.value;
    } else if (target.type === HTMLInputType.CHECKBOX) {
      value = +(target as HTMLInputElement).checked;
    }

    if (target.dataset.multiparameters) {
      newGameOptions = target.dataset.multiparameters
        .split(',')
        .reduce((options, currentOptionName, index) => ({
          ...options,
          ...generateNewGameSettingsOption(
            gameSettingsOptions[currentOptionName],
            target.dataset.iscombined
              ? value.toString().split(target.dataset.separator!)[index]
              : value,
          ),
        }), {});
    } else {
      newGameOptions = {
        [target.name]: generateNewGameSettingsOption(
          gameSettingsOptions[optionId],
          value,
        ),
      };
    }
    if (value.toString()) {
      onSettingOptionChange(newGameOptions);
    }
  }, [gameSettingsOptions, onSettingOptionChange]);

  const getValue = useCallback((
    parameter: IGameSettingsParameter|IGameSettingsItemParameter,
    optionName: string,
  ) => {
    if (
      !isIGameSettingsItemParameter(parameter)
      && parameter.optionType === GameSettingsOptionType.COMBINED
    ) {
      return parameter.items!
        .map((item) => gameSettingsOptions[getOptionName(item)].value)
        .join(parameter.separator);
    }

    return gameSettingsOptions[optionName].value;
  }, [gameSettingsOptions]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Scrollbars
      autoHeight
      autoHide
      autoHeightMax="100%"
      hideTracksWhenNotNeeded
      renderTrackVertical={(props): ReactElement => (
        <div
          {...props}
          className="scrollbar__track"
        />
      )}
      renderThumbVertical={(props): ReactElement => (
        <div
          {...props}
          className="scrollbar__thumb"
        />
      )}
    >
      {
        //Так как опция из gameSettingsFile может
        // иметь разное кол-во параметров из файла,
        // то вывод опций делаем на основе параметров (gameSettingsFiles[fileName].optionsList),
        // а не опций (gameSettingsOptions), иначе получаем дубли контроллеров.
        (isGameSettingsLoaded && Object.keys(gameSettingsOptions).length > 0)
        /* && Object.keys(gameSettingsFiles) */
        // .map(
        //   (fileName) => getParametersForOptionsGenerate(
        //     gameSettingsParameters,
        //     gameSettingsGroups,
        //     locationSettingGroup,
        //   )
        && getParametersForOptionsGenerate(
          gameSettingsParameters,
          gameSettingsGroups,
          gameSettingsFiles,
          locationSettingGroup,
        ).map(
          (parameter) => {
            let optionName = getOptionName(parameter);

            if (parameter.optionType === GameSettingsOptionType.RELATED) {
              return (
                <div
                  key={parameter.id}
                  className={styles['game-settings-content__item']}
                >
                  <div className={styles['game-settings-content__label']}>
                    <span>{parameter.label}</span>
                    {
                          parameter.description
                          && <HintItem description={parameter.description} />
                        }
                  </div>
                  <div className={styles['game-settings-content__subblock']}>
                    {
                          parameter.items!.map((item) => {
                            optionName = getOptionName(item);

                            if (item.controllerType === GameSettingParameterControllerType.SELECT) {
                              return (
                                <Select
                                  key={item.id}
                                  className={classNames(
                                    styles['game-settings-content__item'],
                                    styles['game-settings-content__select'],
                                  )}
                                  id={item.id}
                                  name={optionName}
                                  parent={parameter.file}
                                  description={parameter.description}
                                  value={(gameSettingsOptions[optionName] && getValue(item, optionName)) || 'None'}
                                  // isDisabled={!gameSettingsOptions[parameter.file]}
                                  optionsArr={generateSelectOptions(item.options!)}
                                  onChange={onOptionInputChange}
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

            if (parameter.optionType === GameSettingsOptionType.GROUP) {
              optionName = getOptionName(parameter.items![0]);

              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={parameter.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                    label={parameter.label}
                    description={parameter.description}
                    value={(gameSettingsOptions[optionName] && getValue(parameter.items![0], optionName)) || 'None'}
                    // isDisabled={!gameSettingsOptions[parameter.file]}
                    optionsArr={generateSelectOptions(parameter.options!)}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.CHECKBOX) {
                return (
                  <Checkbox
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(gameSettingsOptions[optionName] && +getValue(parameter.items![0], optionName))}
                    // isDisabled={!gameSettingsOptions[parameter.file]}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(gameSettingsOptions[optionName] && +getValue(parameter.items![0], optionName))}
                    // isDisabled={!gameSettingsOptions[parameter.file]}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.RANGE) {
                return (
                  <Range
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                    label={parameter.label!}
                    description={parameter.description}
                    defaultValue={(gameSettingsOptions[optionName] && getValue(parameter.items![0], optionName)) || '0'}
                    min={parameter.min!}
                    max={parameter.max!}
                    step={parameter.step!}
                    // isDisabled={!gameSettingsOptions[parameter.file]}
                    onChange={onOptionInputChange}
                    onChangeBtnClick={onOptionRangeButtonClick}
                  />
                );
              }
            }

            if (parameter.optionType === GameSettingsOptionType.COMBINED) {
              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={parameter.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                    isCombined
                    separator={parameter.separator}
                    label={parameter.label}
                    description={parameter.description}
                    value={(gameSettingsOptions[optionName] && getValue(parameter, optionName)) || 'None'}
                    // isDisabled={!gameSettingsOptions[parameter.file]}
                    optionsArr={generateSelectOptions(parameter.options!)}
                    onChange={onOptionInputChange}
                  />
                );
              }
            }

            if (parameter.optionType === GameSettingsOptionType.DEFAULT) {
              if (parameter.controllerType === GameSettingParameterControllerType.RANGE) {
                return (
                  <Range
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    defaultValue={(gameSettingsOptions[optionName] && getValue(parameter, optionName)) || '0'}
                    min={parameter.min!}
                    max={parameter.max!}
                    step={parameter.step!}
                    // isDisabled={!gameSettingsOptions[parameter.name!]}
                    label={parameter.label!}
                    description={parameter.description}
                    onChange={onOptionInputChange}
                    onChangeBtnClick={onOptionRangeButtonClick}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.CHECKBOX) {
                return (
                  <Checkbox
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={(gameSettingsOptions[optionName] && Boolean(+getValue(parameter, optionName))) || false}
                    // isDisabled={!gameSettingsOptions[parameter.name!]}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={parameter.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={(gameSettingsOptions[optionName] && Boolean(+getValue(parameter, optionName))) || false}
                    // isDisabled={!gameSettingsOptions[parameter.name!]}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={parameter.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={parameter.id}
                    name={optionName}
                    parent={parameter.file}
                    label={parameter.label}
                    description={parameter.description}
                    value={(gameSettingsOptions[optionName] && getValue(parameter, optionName)) || 'None'}
                    // isDisabled={!gameSettingsOptions[parameter.name!]}
                    optionsArr={generateSelectOptions(parameter.options!)}
                    onChange={onOptionInputChange}
                  />
                );
              }
            }

            return undefined;
          },
        )
          // ),
    }
    </Scrollbars>
  );
};
