import React from 'react';

import { IGameSettingsRootState } from '$types/gameSettings';

interface IProps {
  gameSettings: IGameSettingsRootState,
}

export const GameSettingsBlock: React.FC<IProps> = (props) => <div />;

