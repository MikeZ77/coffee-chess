import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { SimpleComponent } from '../types';

const { div } = hh(h);

const NotificationMessage: SimpleComponent = (state) => {
  return div(
    {
      className: `notification is-light ${state.notificationLevel}`,
      visibility: state.noitificationShow ? '' : 'hidden'
    },
    state.noitificationMessage
  );
};

export default NotificationMessage;
