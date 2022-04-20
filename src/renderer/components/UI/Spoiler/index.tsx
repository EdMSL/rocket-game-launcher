import React, {
  PropsWithChildren, ReactElement, useCallback, useEffect, useRef,
} from 'react';
import classNames from 'classnames';

import { Button } from '$components/UI/Button';
import { IValidationErrors } from '$types/common';

interface ISummaryText {
  label: string,
  text: string,
}

interface IProps<Item> {
  children: ReactElement,
  item: Item,
  items: Item[],
  position: number,
  lastItemId: string,
  validationErrors: IValidationErrors,
  summaryText?: ISummaryText[]|string[],
  onDeleteItem: (items: Item[]) => void,
  onChangeOrderItem?: (items: Item[]) => void,
}

//eslint-disable-next-line @typescript-eslint/comma-dangle
export const Spoiler = <Item extends { id: string, },>({
  children,
  item,
  items,
  position,
  lastItemId,
  validationErrors,
  summaryText = [],
  onDeleteItem,
  onChangeOrderItem,
}: PropsWithChildren<IProps<Item>>): ReactElement => {
  const detailsElementRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (item.id === lastItemId) {
      detailsElementRef.current?.setAttribute('open', 'open');
      detailsElementRef.current?.querySelector('input')?.focus();
    }
  }, [item.id, lastItemId]);

  const onChangeItemOrderBtnClick = useCallback(({ currentTarget }) => {
    if (onChangeOrderItem) {
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
    onDeleteItem(items.filter((currItem) => item.id !== currItem.id));
  }, [item.id, items, onDeleteItem]);

  return (
    <li className={classNames('developer-screen__spoiler-item')}>
      <details
        className={classNames('developer-screen__spoiler-block')}
        ref={detailsElementRef}
      >
        <summary
          className={classNames(
            'developer-screen__spoiler-title',
            Object.keys(validationErrors).some((error) => error.includes(item.id))
            && 'developer-screen__spoiler-title--error',
          )}
        >
          {
            summaryText.length > 0 && summaryText.map((textItem: ISummaryText|string) => {
              if (typeof textItem === 'string') {
                return (
                  <span
                    key={`${textItem}`}
                    className="developer-screen__spoiler-text"
                  >
                    {textItem}
                  </span>
                );
              }
              return (
                <React.Fragment key={`${textItem.label}`}>
                  <span className="developer-screen__spoiler-text">{textItem.label}</span>
                  <span className="developer-screen__spoiler-text">{textItem.text}</span>
                </React.Fragment>
              );
            })
          }
          {
            onChangeOrderItem && (
              <React.Fragment>
                <Button
                  className={classNames(
                    'developer-screen__spoiler-title-btn',
                    'developer-screen__spoiler-title-btn--up',
                  )}
                  name="up"
                  isDisabled={items.length === 1 || position === 0}
                  onClick={onChangeItemOrderBtnClick}
                >
                  Вверх
                </Button>
                <Button
                  className={classNames(
                    'developer-screen__spoiler-title-btn',
                    'developer-screen__spoiler-title-btn--down',
                  )}
                  name="down"
                  isDisabled={items.length === 1 || position === items.length - 1}
                  onClick={onChangeItemOrderBtnClick}
                >
                  Вниз
                </Button>
              </React.Fragment>
            )
          }
          <Button
            className={classNames(
              'developer-screen__spoiler-title-btn',
              'developer-screen__spoiler-title-btn--delete',
            )}
            onClick={onDeleteItemBtnClick}
          >
            Удалить
          </Button>
        </summary>
        {children}
      </details>
    </li>
  );
};
