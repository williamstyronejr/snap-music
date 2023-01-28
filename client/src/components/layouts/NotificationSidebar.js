import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  deleteNotifications,
  getNotifications,
} from '../../actions/notification';
import useDetectOutsideClick from '../shared/useDetectOutsideClick';
import './styles/sidebar.css';

const NotificationSidebar = (props) => {
  const ref = React.useRef(null);
  const [newNotif, setNewNotif] = React.useState(false);
  const [active, setActive] = useDetectOutsideClick(ref);

  React.useEffect(() => {
    props.getNotifications();
  }, []);

  React.useEffect(() => {
    setNewNotif(props.notification.list.length !== 0);
  }, [props.notification.list]);

  return (
    <div className="sidebar" ref={ref}>
      <button
        className="btn sidebar__btn"
        type="button"
        onClick={() => {
          setActive((old) => !old);
        }}
      >
        {newNotif ? <div className="sidebar__pulse" /> : null}
        <i className="fas fa-bell" />
      </button>

      <div
        className={`sidebar__content ${
          active ? 'sidebar__content--active' : ''
        }`}
      >
        <div className="sidebar__options">
          <button
            className="transition-colors sidebar__clear"
            type="button"
            disabled={props.notification.list.length === 0}
            onClick={() => {
              props.deleteNotifications();
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <ul className="sidebar__list">
          {props.notification.list.map((notification) => (
            <li key={notification.id} className="sidebar__item">
              {notification.msg}
            </li>
          ))}
        </ul>

        {props.notification.list.length === 0 ? (
          <div className="sidebar__list-empty">
            Notifcation will show up here
          </div>
        ) : null}
      </div>
    </div>
  );
};

NotificationSidebar.propTypes = {
  getNotifications: PropTypes.func.isRequired,
  deleteNotifications: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    list: PropTypes.array,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  notification: state.notification,
});

const mapDispatchToProps = (dispatch) => ({
  getNotifications: () => dispatch(getNotifications()),
  deleteNotifications: () => dispatch(deleteNotifications()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationSidebar);
