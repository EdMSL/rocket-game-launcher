import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import {
  IGameSettingsItemParameter,
  IGameSettingsOptionsItem,
  IGameSettingsParameter,
  IGameSettingsRootState,
} from '$types/gameSettings';
import {
  generateNewGameSettingsOption,
  generateSelectOptions,
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
import { GameSettingsHintBlock } from '$components/GameSettingsHintBlock';
import { getNumberOfDecimalPlaces, getValueFromRange } from '$utils/strings';
import { Switcher } from '$components/UI/Switcher';
import { IMainRootState } from '$types/main';

interface IProps {
  isGameSettingsLoaded: IMainRootState['isGameSettingsLoaded'],
  gameSettingsFiles: IGameSettingsRootState['gameSettingsFiles'],
  gameSettingsGroups: IGameSettingsRootState['gameSettingsGroups'],
  gameSettingsOptions: IGameSettingsRootState['gameSettingsOptions'],
  onSettingOptionChange: (
    parent: string,
    options: IGameSettingsOptionsItem,
  ) => void,
}

/**
 * Компонент для отображения игровых опций в виде контроллеров.
 * @param gameSettingsFiles Объект с параметрами из `state`, на основе которых сгенерированы
 * опции игровых настроек.
 * @param gameSettingsGroups Массив доступных групп игровых настроек из `state`.
 * @param gameSettingsOptions Объект с обработанными опциями из `state`, готовыми для вывода.
 * @param onSettingOptionChange callback функция, вызываемая при изменении значения опции
 * через контроллер.
*/
export const GameSettingsContent: React.FunctionComponent<IProps> = ({
  isGameSettingsLoaded,
  gameSettingsFiles,
  gameSettingsGroups,
  gameSettingsOptions,
  onSettingOptionChange,
}) => {
  const { settingGroup: locationSettingGroup } = useParams<{ [key: string]: string, }>();

  const [currentHintId, setCurrentHintId] = useState<string>('');

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
      parent,
      generateNewGameSettingsOption(
        gameSettingsOptions,
        parent,
        name,
        isOptionDefaultValueFloat
          ? getValueFromRange(value, min, max).toFixed(getNumberOfDecimalPlaces(value))
          : getValueFromRange(value, min, max),
      ),
    );
  }, [gameSettingsOptions, onSettingOptionChange]);

  const onOptionInputChange = useCallback((
    { target }: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>,
  ) => {
    let value: string|number = '';
    let newGameOptions: IGameSettingsOptionsItem = {};

    if (target.type === HTMLInputType.RANGE) {
      const optionDefaultValue = gameSettingsOptions[target.dataset.parent!][target.name].default;

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
            gameSettingsOptions,
            target.dataset.parent!,
            currentOptionName,
            target.dataset.iscombined
              ? value.toString().split(target.dataset.separator!)[index]
              : value,
          ),
        }), {});
    } else {
      newGameOptions = generateNewGameSettingsOption(
        gameSettingsOptions,
        target.dataset.parent!,
        target.name,
        value,
      );
    }
    if (value.toString()) {
      onSettingOptionChange(target.dataset.parent!, newGameOptions);
    }
  }, [gameSettingsOptions, onSettingOptionChange]);

  const onParameterHover = useCallback((id: string) => {
    setCurrentHintId(id);
  }, []);

  const onParameterLeave = useCallback(() => {
    setCurrentHintId('');
  }, []);

  const getValue = useCallback((
    parameter: IGameSettingsParameter|IGameSettingsItemParameter,
    iniName: string,
  ) => {
    if (
      !isIGameSettingsItemParameter(parameter)
      && parameter.optionType === GameSettingsOptionType.COMBINED
    ) {
      return parameter.items!
        .map((item) => gameSettingsOptions[iniName][getOptionName(item)].value)
        .join(parameter.separator);
    }

    return gameSettingsOptions[iniName][getOptionName(parameter)].value;
  }, [gameSettingsOptions]);

  return (
    <React.Fragment>
      {
        //Так как опция из gameSettingsFile может
        // иметь разное кол-во параметров из файлов,
        // то вывод опций делаем на основе параметров (gameSettingsFiles[fileName].optionsList),
        // а не опций (gameSettingsOptions), иначе получаем дубли контроллеров.
        (isGameSettingsLoaded || Object.keys(gameSettingsOptions).length > 0)
        && Object.keys(gameSettingsFiles)
          .map(
            (fileName) => getParametersForOptionsGenerate(
              gameSettingsFiles[fileName],
              gameSettingsGroups,
              locationSettingGroup,
            ).map(
              (parameter) => {
                if (parameter.optionType === GameSettingsOptionType.RELATED) {
                  return (
                    <div
                      key={parameter.id}
                      className={styles['game-settings-content__item']}
                    >
                      <div className={styles['game-settings-content__label']}>
                        <span>{parameter.label}</span>
                        <GameSettingsHintBlock
                          id={parameter.id}
                          description={parameter.description}
                          currentHintId={currentHintId}
                          onHover={onParameterHover}
                          onLeave={onParameterLeave}
                        />
                      </div>
                      <div className={styles['game-settings-content__subblock']}>
                        {
                          parameter.items!.map((item) => {
                            if (item.controllerType === GameSettingParameterControllerType.SELECT) {
                              return (
                                <Select
                                  key={item.id}
                                  className={classNames(
                                    styles['game-settings-content__item'],
                                    styles['game-settings-content__select'],
                                  )}
                                  id={item.id}
                                  name={getOptionName(item)}
                                  parent={fileName}
                                  description={parameter.description}
                                  value={(gameSettingsOptions[fileName] && getValue(item, fileName)) || 'None'}
                                  isDisabled={!gameSettingsOptions[fileName]}
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
                  if (parameter.controllerType === GameSettingParameterControllerType.SELECT) {
                    return (
                      <Select
                        key={parameter.id}
                        className={classNames(
                          styles['game-settings-content__item'],
                          styles['game-settings-content__select'],
                        )}
                        id={parameter.id}
                        name={getOptionName(parameter.items![0])}
                        parent={fileName}
                        multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                        label={parameter.label}
                        description={parameter.description}
                        value={(gameSettingsOptions[fileName] && getValue(parameter.items![0], fileName)) || 'None'}
                        isDisabled={!gameSettingsOptions[fileName]}
                        optionsArr={generateSelectOptions(parameter.options!)}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
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
                        id={parameter.id}
                        name={getOptionName(parameter.items![0])}
                        parent={fileName}
                        multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                        label={parameter.label!}
                        description={parameter.description}
                        isChecked={Boolean(gameSettingsOptions[fileName] && +getValue(parameter.items![0], fileName))}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter.items![0])}
                        parent={fileName}
                        multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                        label={parameter.label!}
                        description={parameter.description}
                        isChecked={Boolean(gameSettingsOptions[fileName] && +getValue(parameter.items![0], fileName))}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter.items![0])}
                        parent={fileName}
                        multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                        label={parameter.label!}
                        description={parameter.description}
                        defaultValue={(gameSettingsOptions[fileName] && getValue(parameter.items![0], fileName)) || '0'}
                        min={parameter.min!}
                        max={parameter.max!}
                        step={parameter.step!}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onChangeBtnClick={onOptionRangeButtonClick}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter)}
                        parent={fileName}
                        multiparameters={parameter.items!.map((param) => getOptionName(param)).join()}
                        isCombined
                        separator={parameter.separator}
                        label={parameter.label}
                        description={parameter.description}
                        value={(gameSettingsOptions[fileName] && getValue(parameter, fileName)) || 'None'}
                        isDisabled={!gameSettingsOptions[fileName]}
                        optionsArr={generateSelectOptions(parameter.options!)}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter)}
                        parent={fileName}
                        defaultValue={(gameSettingsOptions[fileName] && getValue(parameter, fileName)) || '0'}
                        min={parameter.min!}
                        max={parameter.max!}
                        step={parameter.step!}
                        isDisabled={!gameSettingsOptions[fileName]}
                        label={parameter.label!}
                        description={parameter.description}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onChangeBtnClick={onOptionRangeButtonClick}
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
                        parentClassname="game-settings-content"
                        id={parameter.id}
                        name={getOptionName(parameter)}
                        parent={fileName}
                        label={parameter.label!}
                        description={parameter.description}
                        isChecked={(gameSettingsOptions[fileName] && Boolean(+getValue(parameter, fileName))) || false}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter)}
                        parent={fileName}
                        label={parameter.label!}
                        description={parameter.description}
                        isChecked={(gameSettingsOptions[fileName] && Boolean(+getValue(parameter, fileName))) || false}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        onChange={onOptionInputChange}
                        onHover={onParameterHover}
                        onLeave={onParameterLeave}
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
                        name={getOptionName(parameter)}
                        parent={fileName}
                        label={parameter.label}
                        description={parameter.description}
                        value={(gameSettingsOptions[fileName] && getValue(parameter, fileName)) || 'None'}
                        isDisabled={!gameSettingsOptions[fileName]}
                        currentHintId={currentHintId}
                        optionsArr={generateSelectOptions(parameter.options!)}
                        onChange={onOptionInputChange}
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
