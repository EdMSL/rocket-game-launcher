import React, { useCallback } from 'react';
import classNames from 'classnames';

const styles = require('./styles.module.scss');

interface IProps {
  id: string,
  description?: string,
  iniName?: string,
  parametersNames?: string[],
  iniGroup?: string,
  hintParameter: string,
  onHover: (id: string) => void,
  onLeave: () => void,
}

export const GameSettingsHintBlock: React.FunctionComponent<IProps> = ({
  id,
  description,
  hintParameter,
  onHover,
  onLeave,
}) => {
  const onHintIconHover = useCallback(() => {
    onHover(id);
  }, [onHover, id]);

  const onHintIconLeave = useCallback(() => {
    onLeave();
  }, [onLeave]);

  return (
    <React.Fragment>
      {
        description && (
          <div
            className={styles['settings_hint-icon']}
            onMouseEnter={onHintIconHover}
            onMouseLeave={onHintIconLeave}
          >
            {/*eslint-disable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
            <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
              {/*eslint-enable react/jsx-one-expression-per-line, max-len, react/jsx-tag-spacing, react/jsx-max-props-per-line */}
            {
              hintParameter === id && (
                <div
                  className={classNames('hint__block', styles['settings_hint-block'])}
                >
                  <p className={styles.hint__text}>{description}</p>
                </div>
              )
            }
          </div>
        )
      }
    </React.Fragment>
  );
};
