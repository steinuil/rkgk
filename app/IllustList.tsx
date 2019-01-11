import * as React from 'react';
import { useMappedState } from 'redux-react-hook';
import { Work } from '../src/api/Items';
import { Heart } from './Heart';
import { Store } from './WorkCache';

const Thumbnail = ({ thumbnail, pages }: Work) => (
  <a className="thumbnail">
    <img src={thumbnail} />
    {pages && <div className="pages">{pages}</div>}
    <Heart color="#acc12f" strokeColor="white" />
  </a>
);

export interface Props {
  works: number[];
}

export function WorkList({ works }: Props) {
  const mapState = React.useCallback(
    (state: Store) => works.map((id) => state.works[id]),
    [works]
  );
  const items = useMappedState(mapState);

  return (
    <div>
      {items.map((item) => (
        <Thumbnail {...item} />
      ))}
    </div>
  );
}
