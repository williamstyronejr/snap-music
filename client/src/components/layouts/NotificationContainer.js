import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { closeNotification } from '../../actions/notification';
import './styles/notification.css';

const NotificationContainer = (props) => {
  // On route change, close notification
  React.useEffect(() => {
    if (props.notification.visible) props.closeNotification();
  }, [props.location.pathname]);

  if (!props.notification.visible) return null;

  return (
    <div className="box box--center" data-cy="notification">
      <div className="notification">
        <p className="notification__msg">{props.notification.msg}</p>
        <button
          type="button"
          className="btn btn--close btn--topRight"
          onClick={props.closeNotification}
        >
          x
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

const mapDispatchToProps = (dispatch) => ({
  closeNotification: () => dispatch(closeNotification()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NotificationContainer)
);