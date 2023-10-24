import { AnyAction } from 'redux';
import { produce } from 'immer';
import { UPDATE_USER, UPDATE_USRENAME, REMOVE_USER } from '../../constant';
import { UserInfoState } from './types';

const userState: UserInfoState = {
  username: '',
  email: '',
  phone: '',
};

const user = (state: UserInfoState = userState, action: AnyAction) =>  produce(state, (draftState) => {
  switch(action.type) {
    case UPDATE_USER:
      localStorage.setItem('userInfo', JSON.stringify(action.userInfo));
      Object.assign(draftState, action.userInfo);
      break;
    case REMOVE_USER:
      localStorage.setItem('userInfo', action.userInfo);
      break;
    case UPDATE_USRENAME:
      draftState.username = action.username;
      break;
  }
});

export default user;