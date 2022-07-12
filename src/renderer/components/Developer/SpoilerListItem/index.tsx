import React, {
  ReactElement, useCallback, useEffect, useRef,
} from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { Button } from '$components/UI/Button';
import { IValidationErrors } from '$utils/validation';

interface ISummaryText {
  label: string,
  text: string,
}

interface IProps<Item> {
  children: ReactElement,
  item: Item,
  items: Item[],
  lastItemId: string,
  position?: number,
  validationErrors?: IValidationErrors,
  isDeleteBtnDisabled?: boolean,
  summaryText?: ISummaryText[]|string[],
  onDeleteItem?: (items: Item[], deletedItem: Item) => void,
  onChangeOrderItem?: (items: Item[]) => void,
}

//eslint-disable-next-line @typescript-eslint/comma-dangle
export const SpoilerListItem = <Item extends { id: string, },>({
  children,
  item,
  items,
  position,
  lastItemId,
  validationErrors,
  isDeleteBtnDisabled = false,
  summaryText = [],
  onDeleteItem,
  onChangeOrderItem,
}: IProps<Item>): ReactElement => {
  const detailsElementRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (item.id === lastItemId) {
      detailsElementRef.current?.setAttribute('open', 'open');
      detailsElementRef.current?.querySelector('input')?.focus();
      detailsElementRef.current?.querySelector('input')?.select();
      detailsElementRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [item.id, lastItemId]);

  const onChangeItemOrderBtnClick = useCallback(({ currentTarget }) => {
    if (position !== undefined && onChangeOrderItem) {
      const newItems = [...items];

      if (currentTarget.name === 'up') {
        [
          newItems[position - 1],
          newItems[position],
        ] = [newItems[position], newItems[position - 1]];
      } else {
        [
          newItems[position],
          newItems[position + 1],
        ] = [newItems[position + 1], newItems[position]];
      }

      onChangeOrderItem(newItems);
    }
  }, [items, position, onChangeOrderItem]);

  const onDeleteItemBtnClick = useCallback(() => {
    if (onDeleteItem) onDeleteItem(items.filter((currItem) => item.id !== currItem.id), item);
  }, [item, items, onDeleteItem]);

  return (
    <li className={styles.spoiler__item}>
      <details
        className={styles.spoiler__block}
        ref={detailsElementRef}
      >
        <summary
          className={classNames(
            styles.spoiler__title,
            validationErrors
            && Object.keys(validationErrors).some((error) => error.includes(item.id))
            && styles['spoiler__title--error'],
          )}
        >
          {
            summaryText.length > 0 && summaryText.map((textItem: ISummaryText|string) => {
              if (typeof textItem === 'string') {
                return (
                  <span
                    key={`${textItem}`}
                    className={styles.spoiler__text}
                  >
                    {textItem}
                  </span>
                );
              }
              return (
                <React.Fragment key={`${textItem.label}`}>
                  <span className={styles.spoiler__text}>{textItem.label}</span>
                  <span className={styles.spoiler__text}>{textItem.text}</span>
                </React.Fragment>
              );
            })
          }
          {
            onChangeOrderItem && (
              <React.Fragment>
                <Button
                  className={classNames(
                    styles['spoiler__title-btn'],
                    styles['spoiler__title-btn--up'],
                  )}
                  name="up"
                  isDisabled={items.length === 1 || position === 0}
                  onClick={onChangeItemOrderBtnClick}
                >
                  {/* eslint-disable */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
                  </svg>
                  {/* eslint-enable */}
                </Button>
                <Button
                  className={classNames(
                    styles['spoiler__title-btn'],
                    styles['spoiler__title-btn--down'],
                  )}
                  name="down"
                  isDisabled={items.length === 1 || position === items.length - 1}
                  onClick={onChangeItemOrderBtnClick}
                >
                  {/* eslint-disable */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
                  </svg>
                  {/* eslint-enable */}
                </Button>
              </React.Fragment>
            )
          }
          {
            onDeleteItem && (
            <Button
              className={classNames(
                styles['spoiler__title-btn'],
                styles['spoiler__title-btn--delete'],
              )}
              isDisabled={isDeleteBtnDisabled}
              onClick={onDeleteItemBtnClick}
            >
              {/* eslint-disable */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              {/* eslint-enable */}
            </Button>
            )
          }
        </summary>
        {children}
      </details>
    </li>
  );
};
