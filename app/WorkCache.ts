import * as Redux from 'redux';
import { Work } from '../src/api/Items';

export interface Store {
  works: { [id: number]: Work };
}

const emptyState: Store = {
  works: {},
};

function reducer(state = emptyState, action: Redux.Action<{}>) {
  switch (action.type) {
    default:
      return state;
  }
}

export const store = Redux.createStore(reducer, emptyState);
