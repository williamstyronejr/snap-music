import * as React from 'react';
import { ajaxRequest } from '../../utils/utils';

const RecoveryPage = () => {
  const [status, setStatus] = React.useState('');
  const [user, setUser] = React.useState('');
  const [error, setError] = React.useState(null);

  function onSubmit(evt) {
    evt.preventDefault();

    if (status === 'sending') return;
    if (user === '') {
      setStatus('');
      return setError('You must provide an username');
    }
    setError(null);

    // Set request status to sending to prevent multiple calls
    setStatus('sending');

    ajaxRequest('/account/recovery', 'POST', {
      data: {
        username: user,
      },
    })
      .then((res) => {
        if (res.data.success) setStatus('success');
      })
      .catch((err) => {
        setError(
          err.response && err.response.status === 400
            ? 'You must provide an username'
            : 'An error occurred during the request, please try again later.'
        );

        setStatus('');
      });
  }

  return (
    <section className="recovery">
      <form className="form" method="POST" onSubmit={onSubmit}>
        <h2 className="form__heading">Reset Password</h2>
        <p className="form__heading">Please provide the username.</p>
        {status === 'success' && (
          <div className="form__notification" data-cy="form-success">
            If username exists, an email with password reset instructions will
            be sent to your email address.
          </div>
        )}

        {error ? (
          <div className="form__error" data-cy="form-error">
            {error}
          </div>
        ) : null}

        <fieldset className="form__field">
          <label className="form__label" htmlFor="user">
            <span className="form__labeling">Username</span>
            <input
              className="form__input form__input--text"
              type="text"
              name="user"
              data-cy="user"
              placeholder="Enter user name ..."
              value={user}
              onChange={(evt) => setUser(evt.target.value)}
            />
          </label>
        </fieldset>

        <button
          className="btn btn--submit"
          type="submit"
          data-cy="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Sending
            </>
          ) : (
            'Send Email'
          )}
        </button>
      </form>
    </section>
  );
};

export default RecoveryPage;
