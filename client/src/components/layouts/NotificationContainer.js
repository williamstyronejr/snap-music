import * as React from 'react';
import { connect } from 'react-redux';
import { useResolvedPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import { closeNotification } from '../../actions/notification';
import './styles/notification.css';

const NotificationContainer = (props) => {
  const { pathname } = useResolvedPath();
  // On route change, close notification
  React.useEffect(() => {
    if (props.notification.visible) props.closeNotification();
  }, [pathname]);

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

NotificationContainer.propTypes = {
  closeNotification: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    msg: PropTypes.string,
    visible: PropTypes.bool,
  }).isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationContainer);