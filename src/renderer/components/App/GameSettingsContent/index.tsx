import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IGameSettingsParameters,
  IGameSettingsOption,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  changeParameterValue,
  generateSelectOptions,
  getOptionNameAndId,
  getOptionsForOutput,
} from '$utils/data';
import {
  UIControllerType,
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
import { ScrollbarsBlock } from '$components/UI/ScrollbarsBlock';

interface IProps {
  isGameSettingsLoaded: IMainRootState['isGameSettingsLoaded'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsParameters: IGameSettingsRootState['gameSettingsParameters'],
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
  onSettingOptionChange: (parameters: IGameSettingsParameters) => void,
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
 * @param isGameSettingsLoaded Загружены ли игровые настройки. Берется из `state`.
 * @param gameSettingsGroups Группы игровых настроек из `state`.
 * @param gameSettingsFiles Файлы игровых настроек из `state`.
 * @param gameSettingsOptions Опции игровых настроек из `state`.
 * @param gameSettingsParameters Параметры игровых настроек из `state`.
 * @param onSettingOptionChange Функция, вызываемая при изменении опции
 * через контроллер.
*/
export const GameSettingsContent: React.FunctionComponent<IProps> = ({
  isGameSettingsLoaded,
  gameSettingsGroups,
  gameSettingsFiles,
  gameSettingsOptions,
  gameSettingsParameters,
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
    const currentParameter = gameSettingsParameters[optionId];

    const isParameterDefaultValueFloat = /\./g.test(currentParameter.default);
    const value = isParameterDefaultValueFloat
      ? (+currentParameter.value + newStep).toFixed(getNumberOfDecimalPlaces(currentParameter.default))
      : (+currentParameter.value + newStep).toFixed(getNumberOfDecimalPlaces(step));

    onSettingOptionChange(
      {
        [optionId]: changeParameterValue(
          gameSettingsParameters[optionId],
          isParameterDefaultValueFloat
            ? getValueFromRange(value, min, max).toFixed(getNumberOfDecimalPlaces(value))
            : getValueFromRange(value, min, max),
        ),
      },
    );
  }, [gameSettingsParameters, onSettingOptionChange]);

  const onOptionInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>,
  ) => {
    let value: string|number = '';
    let newGameParameters: IGameSettingsParameters = {};

    if (target.type === HTMLInputType.RANGE) {
      const parameterDefaultValue = gameSettingsParameters[target.id].default;

      value = /\./g.test(parameterDefaultValue)
        ? (+target.value).toFixed(getNumberOfDecimalPlaces(parameterDefaultValue))
        : target.value;
    } else if (target.type === HTMLInputType.SELECT) {
      value = target.value;
    } else if (target.type === HTMLInputType.CHECKBOX) {
      value = +(target as HTMLInputElement).checked;
    }

    if (target.dataset.multiparameters) {
      newGameParameters = target.dataset.multiparameters
        .split(',')
        .reduce<IGameSettingsParameters>((parameters, currentParameterId, index) => {
          let newValue: string|number = '';

          if (target.dataset.optiontype === GameSettingsOptionType.COMBINED) {
            newValue = value.toString().split(target.dataset.separator!)[index];
          } else if (target.dataset.optiontype === GameSettingsOptionType.RELATED) {
            newValue = currentParameterId === target.id
              ? value
              : gameSettingsParameters[currentParameterId].value;
          } else { //optiontype === "GROUP"
            newValue = value;
          }

          return {
            ...parameters,
            [currentParameterId]: changeParameterValue(
              gameSettingsParameters[currentParameterId],
              newValue,
            ),
          };
        }, {});
    } else {
      newGameParameters = {
        [target.id]: changeParameterValue(
          gameSettingsParameters[target.id],
          value,
        ),
      };
    }

    if (value.toString()) {
      onSettingOptionChange(newGameParameters);
    }
  }, [gameSettingsParameters, onSettingOptionChange]);

  const getCombinedValue = (option: IGameSettingsOption): string => option.items
    .map((item) => gameSettingsParameters[getOptionNameAndId(item).id].value)
    .join(option.separator);

  const getValue = useCallback((
    controllerType: UIControllerType,
    optionId: string,
  ) => {
    if (
      controllerType === UIControllerType.CHECKBOX
      || controllerType === UIControllerType.SWITCHER
      || controllerType === UIControllerType.RANGE
    ) {
      return (gameSettingsParameters[optionId] && gameSettingsParameters[optionId].value) || '0';
    } else if (controllerType === UIControllerType.SELECT) {
      return (gameSettingsParameters[optionId] && gameSettingsParameters[optionId].value) || 'None';
    }

    return '';
  }, [gameSettingsParameters]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ScrollbarsBlock>
      {
        (isGameSettingsLoaded && Object.keys(gameSettingsParameters).length > 0)
        && getOptionsForOutput(
          gameSettingsOptions,
          gameSettingsGroups,
          gameSettingsFiles,
          locationSettingGroup,
        ).map(
          (option) => {
            let optionData = getOptionNameAndId(option.items[0]);

            if (option.optionType === GameSettingsOptionType.RELATED) {
              return (
                <div
                  key={option.id}
                  className={styles['game-settings-content__item']}
                >
                  <div className={styles['game-settings-content__label']}>
                    <span>{option.label}</span>
                    {
                      option.description
                      && <HintItem description={option.description} />
                    }
                  </div>
                  <div className={styles['game-settings-content__subblock']}>
                    {
                      option.items.map((item) => {
                        optionData = getOptionNameAndId(item);
                        const multiparameters = option.items.map((item) => getOptionNameAndId(item).id).join();

                        if (item.controllerType === UIControllerType.SELECT) {
                          return (
                            <Select
                              key={optionData.id}
                              className={classNames(
                                styles['game-settings-content__item'],
                                styles['game-settings-content__select'],
                              )}
                              id={optionData.id}
                              name={optionData.name}
                              parent={option.file}
                              multiparameters={multiparameters}
                              description={option.description}
                              optionType={option.optionType}
                              selectOptions={generateSelectOptions(item.selectOptions!)}
                              value={getValue(item.controllerType, optionData.id)}
                              onChange={onOptionInputChange}
                            />
                          );
                        }

                        return <React.Fragment />;
                      })
                    }
                  </div>
                </div>
              );
            }

            if (option.optionType === GameSettingsOptionType.GROUP) {
              const multiparameters = option.items.map((item) => getOptionNameAndId(item).id).join();

              if (option.controllerType === UIControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    multiparameters={multiparameters}
                    label={option.label}
                    description={option.description}
                    optionType={option.optionType}
                    selectOptions={generateSelectOptions(option.selectOptions!)}
                    value={getValue(option.controllerType!, optionData.id)}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (option.controllerType === UIControllerType.CHECKBOX) {
                return (
                  <Checkbox
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    multiparameters={multiparameters}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    isChecked={Boolean(+getValue(option.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (option.controllerType === UIControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    multiparameters={multiparameters}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    isChecked={Boolean(+getValue(option.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (option.controllerType === UIControllerType.RANGE) {
                return (
                  <Range
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    multiparameters={multiparameters}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    defaultValue={getValue(option.controllerType!, optionData.id)}
                    min={option.min!}
                    max={option.max!}
                    step={option.step!}
                    onChange={onOptionInputChange}
                    onChangeBtnClick={onOptionRangeButtonClick}
                  />
                );
              }
            }

            if (option.optionType === GameSettingsOptionType.COMBINED) {
              const multiparameters = option.items.map((item) => getOptionNameAndId(item).id).join();

              if (option.controllerType === UIControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    multiparameters={multiparameters}
                    label={option.label}
                    description={option.description}
                    optionType={option.optionType}
                    separator={option.separator}
                    selectOptions={generateSelectOptions(option.selectOptions!)}
                    value={getCombinedValue(option)}
                    onChange={onOptionInputChange}
                  />
                );
              }
            }

            if (option.optionType === GameSettingsOptionType.DEFAULT) {
              if (option.controllerType === UIControllerType.RANGE) {
                return (
                  <Range
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    defaultValue={getValue(option.controllerType!, optionData.id)}
                    min={option.min!}
                    max={option.max!}
                    step={option.step!}
                    onChange={onOptionInputChange}
                    onChangeBtnClick={onOptionRangeButtonClick}
                  />
                );
              }

              if (option.controllerType === UIControllerType.CHECKBOX) {
                return (
                  <Checkbox
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    isChecked={Boolean(+getValue(option.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (option.controllerType === UIControllerType.SWITCHER) {
                return (
                  <Switcher
                    key={optionData.id}
                    className={styles['game-settings-content__item']}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    label={option.label!}
                    description={option.description}
                    optionType={option.optionType}
                    isChecked={Boolean(+getValue(option.controllerType!, optionData.id))}
                    onChange={onOptionInputChange}
                  />
                );
              }

              if (option.controllerType === UIControllerType.SELECT) {
                return (
                  <Select
                    key={optionData.id}
                    className={classNames(
                      styles['game-settings-content__item'],
                      styles['game-settings-content__select'],
                    )}
                    id={optionData.id}
                    name={optionData.name}
                    parent={option.file}
                    label={option.label}
                    description={option.description}
                    optionType={option.optionType}
                    selectOptions={generateSelectOptions(option.selectOptions!)}
                    value={getValue(option.controllerType!, optionData.id)}
                    onChange={onOptionInputChange}
                  />
                );
              }
            }

            return <React.Fragment />;
          },
        )
      }
    </ScrollbarsBlock>
  );
};
