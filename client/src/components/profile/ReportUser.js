import * as React from 'react';
import PropTypes from 'prop-types';
import { ajaxRequest } from '../../utils/utils';
import useDetectOutsideClick from '../shared/useDetectOutsideClick';
import './styles/reportUser.css';

const ReportUser = (props) => {
  const formRef = React.createRef();
  const [profile, setProfile] = React.useState(false);
  const [track, setTrack] = React.useState(false);
  const [details, setDetails] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [active, setActive] = useDetectOutsideClick(formRef, true);

  const onSubmit = (evt) => {
    evt.preventDefault();

    if (details === '' && !profile && !track) return;

    ajaxRequest(`/report/profile/${props.userId}`, 'POST', {
      data: {
        profile,
        track,
        details,
      },
    })
      .then((res) => {
        // Give user notice that report was sent, and close report window
        props.setNotification('Report sent!');
        props.onCancel();
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          if (err.response.data.user) {
            props.setNotificationError(
              'The user you are reporting does not exist.'
            );
            props.onCancel();
            return;
          }

          setErrors({ ...errors, ...err.response.data });
          return;
        }

        props.setNotificationError(
          'An error occurred when reporting user, please try again later.'
        );
        props.onCancel();
      });
  };

  // If user clicks outside of form, cancel report and close window
  if (!active) props.onCancel();

  return (
    <div className="report">
      <form
        className="form form--report"
        method="POST"
        action={`/report/profile/${props.userId}`}
        onSubmit={onSubmit}
        ref={formRef}
      >
        <button
          type="button"
          className="btn btn--close btn--close-invert"
          onClick={props.onCancel}
        >
          X
        </button>

        <h3 className="form__heading">Report User</h3>

        <fieldset className="form__field">
          <legend className="form__legend">Reason</legend>

          <label className="form__label form__label--space" htmlFor="profile">
            <div className="form__indent">
              <input
                className="form__input form__input--checkbox"
                type="checkbox"
                id="profile"
                name="reason"
                checked={profile}
                onChange={(evt) => setProfile(evt.target.checked)}
                data-cy="profile"
              />
              <span className="form__labeling form__labeling--inline form__labeling--checkbox">
                Profile
              </span>
            </div>
          </label>

          <label className="form__label form__label--space" htmlFor="track">
            <div className="form__indent">
              <input
                className="form__input form__input--checkbox"
                type="checkbox"
                id="track"
                name="reason"
                checked={track}
                onChange={(evt) => setTrack(evt.target.checked)}
              />
              <span className="form__labeling form__labeling--inline  form__labeling--checkbox">
                Track
              </span>
            </div>
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="details">
            <span className="form__labeling">
              Details ({details ? 500 - details.length : '500'} characters left)
            </span>

            {errors.details ? (
              <span className="form__error">{errors.details}</span>
            ) : null}

            <textarea
              className="form__input form__input--textarea"
              name="details"
              cols="6"
              resizeable="false"
              maxLength="500"
              placeholder="Adding some details will help us take proper actions ..."
              value={details}
              onChange={(evt) => setDetails(evt.target.value)}
              data-cy="details"
            />
          </label>
        </fieldset>

        <button className="btn btn--submit" type="submit" data-cy="submit">
          Submit
        </button>

        <button
          className="btn btn--cancel"
          type="button"
          data-cy="cancel"
          onClick={props.onCancel}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

ReportUser.propTypes = {
  setNotificationError: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ReportUser;
