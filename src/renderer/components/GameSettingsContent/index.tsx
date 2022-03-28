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
  getOptionName,
  getOptionNameAndId,
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
import { IGameSettingsControllerType } from '$types/common';

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
    optionId: string,
    min: number,
    max: number,
    step: number,
  ) => {
    const newStep = btnName === RangeButtonName.INCREASE ? step : 0 - step;
    const currentOption = gameSettingsOptions[optionId];

    const isOptionDefaultValueFloat = /\./g.test(currentOption.default);
    const value = isOptionDefaultValueFloat
      ? (+currentOption.value + newStep).toFixed(getNumberOfDecimalPlaces(currentOption.default))
      : (+currentOption.value + newStep).toFixed(getNumberOfDecimalPlaces(step));

    onSettingOptionChange(
      {
        [optionId]: generateNewGameSettingsOption(
          gameSettingsOptions[optionId],
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
    let value: string|number = '';
    let newGameOptions: IGameSettingsOptions = {};

    if (target.type === HTMLInputType.RANGE) {
      const optionDefaultValue = gameSettingsOptions[target.id].default;

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
        .reduce<IGameSettingsOptions>((options, currentOptionName, index) => ({
          ...options,
          [currentOptionName]: generateNewGameSettingsOption(
            gameSettingsOptions[currentOptionName],
            target.dataset.iscombined
              ? value.toString().split(target.dataset.separator!)[index]
              : value,
          ),
        }), {});
    } else {
      newGameOptions = {
        [target.id]: generateNewGameSettingsOption(
          gameSettingsOptions[target.id],
          value,
        ),
      };
    }

    if (value.toString()) {
      onSettingOptionChange(newGameOptions);
    }
  }, [gameSettingsOptions, onSettingOptionChange]);

  const getCombinedValue = (parameter: IGameSettingsParameter): string => parameter.items!
    .map((item) => gameSettingsOptions[getOptionNameAndId(item).id].value)
    .join(parameter.separator);

  const getValue = useCallback((
    controllerType: IGameSettingsControllerType,
    optionId: string,
  ) => {
    if (
      controllerType === GameSettingParameterControllerType.CHECKBOX
      || controllerType === GameSettingParameterControllerType.SWITCHER
      || controllerType === GameSettingParameterControllerType.RANGE
    ) {
      return (gameSettingsOptions[optionId] && gameSettingsOptions[optionId].value) || '0';
    } else if (controllerType === GameSettingParameterControllerType.SELECT) {
      return (gameSettingsOptions[optionId] && gameSettingsOptions[optionId].value) || 'None';
    }

    return '';
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
        && getParametersForOptionsGenerate(
          gameSettingsParameters,
          gameSettingsGroups,
          gameSettingsFiles,
          locationSettingGroup,
        ).map(
          (parameter) => {
            let optionData = getOptionNameAndId(parameter);

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
                            optionData = getOptionNameAndId(item);

                            if (item.controllerType === GameSettingParameterControllerType.SELECT) {
                              return (
                                <Select
                                  key={optionData.id}
                                  className={classNames(
                                    styles['game-settings-content__item'],
                                    styles['game-settings-content__select'],
                                  )}
                                  id={optionData.id}
                                  name={optionData.name}
                                  parent={parameter.file}
                                  description={parameter.description}
                                  value={getValue(parameter.controllerType!, optionData.id)}
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
              optionData = getOptionNameAndId(parameter.items![0]);
              const multiparameters = parameter.items!.map((param) => getOptionNameAndId(param).id).join();

              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    multiparameters={multiparameters}
                    label={parameter.label}
                    description={parameter.description}
                    value={getValue(parameter.controllerType!, optionData.id)}
                    optionsArr={generateSelectOptions(parameter.options!)}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.CHECKBOX) {
                return (
                  <Checkbox
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    multiparameters={multiparameters}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(+getValue(parameter.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    multiparameters={multiparameters}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(+getValue(parameter.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.RANGE) {
                return (
                  <Range
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    multiparameters={multiparameters}
                    label={parameter.label!}
                    description={parameter.description}
                    defaultValue={getValue(parameter.controllerType!, optionData.id)}
                    min={parameter.min!}
                    max={parameter.max!}
                    step={parameter.step!}
                    onChange={onOptionInputChange}
                    onChangeBtnClick={onOptionRangeButtonClick}
                  />
                );
              }
            }

            if (parameter.optionType === GameSettingsOptionType.COMBINED) {
              optionData = getOptionNameAndId(parameter.items![0]);
              const multiparameters = parameter.items!.map((item) => getOptionNameAndId(item).id).join();

              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    multiparameters={multiparameters}
                    isCombined
                    separator={parameter.separator}
                    label={parameter.label}
                    description={parameter.description}
                    value={getCombinedValue(parameter)}
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
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    defaultValue={getValue(parameter.controllerType!, optionData.id)}
                    min={parameter.min!}
                    max={parameter.max!}
                    step={parameter.step!}
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
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(+getValue(parameter.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    parentClassname="game-settings-content"
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    label={parameter.label!}
                    description={parameter.description}
                    isChecked={Boolean(+getValue(parameter.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={parameter.file}
                    label={parameter.label}
                    description={parameter.description}
                    value={getValue(parameter.controllerType!, optionData.id)}
                    optionsArr={generateSelectOptions(parameter.options!)}
                    onChange={onOptionInputChange}
                  />
                );
              }
            }

            return <React.Fragment />;
          },
        )
    }
    </Scrollbars>
  );
};
