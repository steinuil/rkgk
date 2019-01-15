import * as React from 'react';
import { useMappedState } from 'redux-react-hook';
import { Work } from '../src/api/Items';
// import { Heart } from './Heart';
import { Store } from './WorkCache';

// const proxyImage = (src: string) =>
//   src.replace('https://i.pximg.net/', '/pixiv/img/');

export const Thumbnail = ({ pages }: Work) => (
  <a className="thumbnail">
    {/* <img src={proxyImage(thumbnail)} width="200" height="200" /> */}
    {pages && <div className="pages">{pages}</div>}
    {/* <Heart color="#acc12f" strokeColor="white" /> */}
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
