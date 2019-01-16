import * as React from 'react';
import { useMappedState } from 'redux-react-hook';
import { Work } from '../src/api/Items';
import { Heart } from './Heart';
import { Store } from './WorkCache';

const proxyImage = (src: string) =>
  src.replace('https://i.pximg.net/', '/pixiv/img/');

export const Thumbnail = ({ pages, user, thumbnail }: Work) => (
  <a className="thumbnail">
    <img className="picture" src={proxyImage(thumbnail)} />
    <div className="user">
      <img className="avatar" src={proxyImage(user.avatar)} />
      <div className="name">{user.displayName}</div>
    </div>
    {pages > 1 && <div className="pages">{pages}</div>}
    <Heart />
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
