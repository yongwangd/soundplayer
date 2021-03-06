import Rx from 'rxjs/Rx';
import * as R from 'ramda';
import { combineEpics } from 'redux-observable';
import { actionCreator } from './actionHelper';
import { SET_CURRENT_PLAYING, RESET_AUDIO_STATE } from './audioActionReducer';
import { getMd5 } from '../utils/idUtil';

const initialState = {
  groupSet: {
    all: {
      type: 'default',
      name: 'All',
      hideInDropdown: true,
      icon: 'library_music',
    },
    favorite: {
      type: 'default',
      name: 'Favorites',
      icon: 'favorite',
    },
    onlineDownload: {
      type: 'default',
      name: 'Online Download',
      hideInDropdown: true,
      icon: 'cloud_download',
    },
  },
  activeGroup: 'all',
  currentPlayingGroup: 'all',
};

export const ADD_GROUP = 'ADD_GROUP';
export const REMOVE_GROUP = 'REMOVE_GROUP';
export const SET_GROUP_ACTIVE = 'SET_GROUP_ACTIVE';
export const SET_CURRENT_PLAYING_GROUP = 'SET_CURRENT_PLAYING_GROUP';
export const RESET_GROUP_STATE = 'RESET_GROUP_STATE';

export const actions = {
  resetGroupState: () => actionCreator(RESET_AUDIO_STATE, null),
  addGroup: actionCreator(ADD_GROUP),
  removeGroup: actionCreator(REMOVE_GROUP),
  setActiveGroup: actionCreator(SET_GROUP_ACTIVE),
  setCurrentPlayingGroup: actionCreator(SET_CURRENT_PLAYING_GROUP),
};

const REMOVE_GROUP_PRIVATE = 'REMOVE_GROUP_PRIVATE';
const removeGroupPrivate = actionCreator(REMOVE_GROUP_PRIVATE);

const actionHandler = {
  [RESET_AUDIO_STATE]: state => ({
    ...initialState,
    activeGroup: state.activeGroup,
    currentPlayingGroup: state.currentPlayingGroup,
  }),
  [ADD_GROUP]: (state, { payload }) =>
    R.evolve({
      groupSet: R.assoc(getMd5(payload), {
        type: 'custom',
        name: payload,
      }),
    })(state),
  [REMOVE_GROUP_PRIVATE]: (state, { payload }) =>
    R.evolve({
      groupSet: R.dissoc(payload),
    })(state),
  [SET_GROUP_ACTIVE]: (state, { payload }) => R.assoc('activeGroup', payload, state),
  [SET_CURRENT_PLAYING_GROUP]: (state, { payload }) =>
    R.assoc('currentPlayingGroup', payload, state),
};

const groupReducer = (state = initialState, action) => {
  const handler = actionHandler[action.type];
  return handler ? handler(state, action) : state;
};

const setCurrentPlayingAudioGroupEpic = (action$, store) =>
  action$
    .ofType(SET_CURRENT_PLAYING)
    .map(() => store.getState().groupChunk.activeGroup)
    .map(actions.setCurrentPlayingGroup);

const removeGroupEpic = (action$, store) =>
  action$
    .ofType(REMOVE_GROUP)
    .pluck('payload')
    .filter(groupId =>
      R.pathEq(['groupChunk', 'groupSet', groupId, 'type'], 'custom', store.getState()),
    )
    .flatMap(groupId => {
      const { activeGroup, currentPlayingGroup } = store.getState().groupChunk;
      const actionList = [removeGroupPrivate(groupId)];
      if (groupId === activeGroup) actionList.push(actions.setActiveGroup('all'));
      if (groupId === currentPlayingGroup) actionList.push(actions.setCurrentPlayingGroup('all'));
      return actionList;
    });

export const groupEpics = combineEpics(setCurrentPlayingAudioGroupEpic, removeGroupEpic);

export default groupReducer;
