import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../shared/ConfirmDialog';
import { updateUserData, unauthUser } from '../../actions/user';
import { ajaxRequest } from '../../utils/utils';
import {
  setNotificationError,
  setNotification,
} from '../../actions/notification';
import './styles/settingsPage.css';

const PasswordForm = ({ setNotificationError, setNotification }) => {
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [requesting, setRequesting] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const onSubmit = (evt) => {
    evt.preventDefault();
    setErrors({});

    if (requesting) return;
    setRequesting(true);

    ajaxRequest('/settings/password', 'POST', {
      data: {
        currentPass: oldPassword,
        newPass: newPassword,
        confirmPass: confirm,
      },
    })
      .then(() => {
        setRequesting(false);
        setNotification('Password updated.');
      })
      .catch((err) => {
        setRequesting(false);
        if (err.response.status === 400) return setErrors(err.response.data);
        setNotificationError(
          'An error occurred when updating password, please try again later.'
        );
      });
  };

  return (
    <form className="form" method="POST" onSubmit={onSubmit}>
      <h3 className="form__heading">Change Password</h3>

      <fieldset className="form__field">
        <label className="form__label" htmlFor="old">
          <span className="form__labeling">Old Password</span>
          <span className="form__labeling--error" data-cy="error">
            {errors.currentPass}
          </span>
          <input
            className={`form__input form__input--text ${
              errors.currentPass ? 'form__input--error' : ''
            }`}
            type="password"
            name="old"
            data-cy="oldPassword"
            value={oldPassword}
            onChange={(evt) => setOldPassword(evt.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="form__field">
        <label className="form__label" htmlFor="new">
          <span className="form__labeling">New Password</span>
          <span className="form__labeling--error" data-cy="error">
            {errors.newPass}
          </span>
          <input
            className={`form__input form__input--text ${
              errors.newPass ? 'form__input--error' : ''
            }`}
            type="password"
            name="new"
            data-cy="newPassword"
            value={newPassword}
            onChange={(evt) => setNewPassword(evt.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="form__field">
        <label className="form__label" htmlFor="confirm">
          <span className="form__labeling">Confirm New Password</span>
          <span className="form__labeling--error" data-cy="error">
            {errors.confirmPass}
          </span>
          <input
            className="form__input form__input--text"
            type="password"
            name="confirm"
            data-cy="confirmPassword"
            value={confirm}
            onChange={(evt) => setConfirm(evt.target.value)}
          />
        </label>
      </fieldset>

      <button className="btn btn--submit" type="submit" disabled={requesting}>
        Update Password
      </button>
    </form>
  );
};

const AccountForm = ({
  currentUsername,
  currentDisplayName,
  currentEmail,
  currentBio,
  currentProfileImage,
  updateUser,
  setNotificationError,
  setNotification,
  unauthUser,
}) => {
  const [username, setUsername] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [confirmVisibility, setConfirmVisibility] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const fileRef = React.useRef();

  const onSubmit = (evt) => {
    evt.preventDefault();
    setErrors({});
    const data = {};

    if (requesting) return;
    setRequesting(true);

    if (username) data.username = username;
    if (email) data.email = email;
    if (bio) data.bio = bio;
    if (displayName) data.displayName = displayName;

    ajaxRequest('/settings/account', 'POST', {
      data,
    })
      .then((res) => {
        setRequesting(false);
        if (res.data.success) {
          updateUser(data);
          return setNotification('User updated successfully');
        }

        setErrors(res.data.errors);
      })
      .catch((err) => {
        setRequesting(false);
        if (err.response && err.response.status === 400) {
          return setErrors(err.response.data);
        }

        return setNotificationError(
          'An error has occurred during update, please try again later.'
        );
      });
  };

  const onDelete = () => {
    if (requesting) return;

    setRequesting(true);
    ajaxRequest('/settings/account/deletion', 'POST')
      .then(() => {
        setRequesting(false);
        setConfirmVisibility(false);
        unauthUser();
      })
      .catch(() => {
        setRequesting(false);
        setNotificationError(
          'An error has occurred during account deletion, please try again later.'
        );
      });
  };

  const submitProfileImage = (file, remove = false) => {
    setErrors({});
    const data = new FormData();

    if (requesting) return;
    setRequesting(true);

    if (file) data.append('profile', file);
    if (remove) data.append('remove', remove);

    ajaxRequest('/settings/account/image', 'POST', {
      data,
      headers: { 'content-type': 'mutlipart/form-data' },
    })
      .then((res) => {
        if (res.data.success && res.data.updated) updateUser(res.data.data);
        setRequesting(false);
      })
      .catch((err) => {
        setRequesting(false);
        if (err.response && err.response.status === 400) {
          return setErrors(err.response.data);
        }

        return setNotificationError(
          'An error occurred during update, please try again later.'
        );
      });
  };

  return (
    <>
      <form className="form" method="POST">
        <h3 className="form__heading">Account</h3>
        <fieldset className="form__field">
          <label className="form__label" htmlFor="profile">
            <button
              className="btn btn--image"
              type="button"
              disabled={requesting}
              onClick={() => {
                fileRef.current.click();
              }}
            >
              <img
                className="form__image"
                alt="User profile"
                src={currentProfileImage ? `${currentProfileImage}` : ''}
              />
            </button>
            <span
              className="form__labeling form__labeling--center"
              data-cy="name-display"
            >
              {currentUsername}
            </span>
            <button
              className="btn btn--remove"
              type="button"
              disabled={
                currentProfileImage &&
                currentProfileImage.endsWith('default.jpeg')
              }
              onClick={() => submitProfileImage(null, true)}
            >
              Remove current picture
            </button>

            <input
              type="file"
              ref={fileRef}
              className={`form__input form__input--file ${
                errors.file ? 'form__input--error' : ''
              }`}
              name="profile"
              accept="image/jpeg,image/png"
              onChange={(evt) => {
                submitProfileImage(evt.target.files[0]);
              }}
            />
          </label>
        </fieldset>

        {confirmVisibility ? (
          <ConfirmDialog
            message="This action is irreversible, are you sure you want to delete your account?"
            onConfirm={onDelete}
            onCancel={() => setConfirmVisibility(false)}
          />
        ) : null}

        <button
          className="btn btn--delete"
          type="button"
          data-cy="delete"
          onClick={() => setConfirmVisibility(true)}
        >
          Delete Account
        </button>
      </form>

      <form className="form" method="POST" onSubmit={onSubmit}>
        <fieldset className="form__field">
          <label className="form__label" htmlFor="username">
            <span className="form__labeling">Username</span>
            <span className="form__labeling--error" data-cy="field-error">
              {errors.username ? errors.username : null}
            </span>
            <input
              className={`form__input form__input--text ${
                errors.username ? 'form__input--error' : ''
              }`}
              type="text"
              name="username"
              data-cy="username"
              value={username}
              placeholder={currentUsername}
              onChange={(evt) => setUsername(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="displayName">
            <span className="form__labeling">Display Name</span>
            <span className="form__labeling--error" data-cy="field-error">
              {errors.displayName ? errors.displayName : null}
            </span>

            <input
              id="displayName"
              className={`form__input form__input--text ${
                errors.displayName ? 'form__input--error' : ''
              }`}
              type="text"
              data-cy="displayName"
              value={displayName}
              placeholder={currentDisplayName}
              onChange={(evt) => setDisplayName(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="email">
            <span className="form__labeling">Email</span>
            <span className="form__labeling--error" data-cy="field-error">
              {errors.email ? errors.email : null}
            </span>
            <input
              className={`form__input form__input--text ${
                errors.username ? 'form__input--error' : ''
              }`}
              type="text"
              name="new"
              data-cy="email"
              value={email}
              placeholder={currentEmail}
              onChange={(evt) => setEmail(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="bio">
            <span className="form__labeling">Bio</span>
            <textarea
              className="form__input form__input--textarea"
              name="bio"
              value={bio}
              data-cy="bio"
              placeholder={currentBio}
              onChange={(evt) => setBio(evt.target.value)}
            />
          </label>
        </fieldset>

        <button className="btn btn--submit" type="submit" disabled={requesting}>
          Update Account
        </button>
      </form>
    </>
  );
};

const SettingsPage = (props) => {
  const { type } = useSearchParams();
  let content;

  switch (type) {
    case 'password':
      content = (
        <PasswordForm
          setNotification={props.setNotification}
          setNotificationError={props.setNotificationError}
        />
      );
      break;

    case 'account':
      content = (
        <AccountForm
          currentUsername={props.user.username}
          currentDisplayName={props.user.displayName}
          currentEmail={props.user.email}
          currentBio={props.user.bio}
          currentProfileImage={props.user.profilePicture}
          updateUser={props.updateUserData}
          setNotification={props.setNotification}
          setNotificationError={props.setNotificationError}
          unauthUser={props.unauthUser}
        />
      );
      break;

    default:
      // Redirect to account settings on default
      return <Navigate to="/settings/account" />;
  }

  return (
    <section className="settings">
      {props.user.username === 'guest' ? (
        <div className="settings__overlay">
          <span>Guest user is not allow to make settings changes.</span>
        </div>
      ) : null}
      <aside className="settings__aside">
        <ul className="settings__list">
          <li className="settings__item">
            <Link
              to="/settings/account"
              className={`settings__link ${
                type === 'account' ? 'settings__link--active' : ''
              }`}
            >
              Account
            </Link>
          </li>

          <li className="settings__item">
            <Link
              to="/settings/password"
              className={`settings__link ${
                type === 'password' ? 'settings__link--active' : ''
              }`}
            >
              Password
            </Link>
          </li>
        </ul>
      </aside>

      <div className="settings__content">{content}</div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  updateUserData: (data) => dispatch(updateUserData(data)),
  setNotificationError: (msg) => dispatch(setNotificationError(msg)),
  setNotification: (msg) => dispatch(setNotification(msg)),
  unauthUser: () => dispatch(unauthUser()),
});

AccountForm.propTypes = {
  currentUsername: PropTypes.string.isRequired,
  currentDisplayName: PropTypes.string.isRequired,
  currentEmail: PropTypes.string.isRequired,
  currentBio: PropTypes.string.isRequired,
  currentProfileImage: PropTypes.string.isRequired,
  updateUser: PropTypes.func.isRequired,
  setNotificationError: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  unauthUser: PropTypes.func.isRequired,
};

PasswordForm.propTypes = {
  setNotification: PropTypes.func.isRequired,
  setNotificationError: PropTypes.func.isRequired,
};

SettingsPage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    profilePicture: PropTypes.string,
  }).isRequired,
  updateUserData: PropTypes.func.isRequired,
  setNotificationError: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  unauthUser: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
