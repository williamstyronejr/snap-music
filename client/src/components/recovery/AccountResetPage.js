import * as React from 'react';
import { ajaxRequest } from '../../utils/utils';

const AccountReset = () => {
  const [status, setStatus] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);

  function onSubmit(evt) {
    evt.preventDefault();

    setError(null);

    if (status === 'sending') return;
    if (password === '') {
      setError('You must provide a password');
      return;
    }

    setStatus('sending');
    ajaxRequest(window.location.href, 'POST', {
      data: {
        password,
      },
    })
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setStatus('');
          setError(
            err.response.data.token
              ? 'Your reset request has been timed out. Please make a new request to reset your password.'
              : err.response.data.password
          );
          return;
        }

        setError('An error occurred on the server, please try again.');
      });
  }

  return (
    <section>
      <form className="form" method="POST" onSubmit={onSubmit}>
        <h3 className="form__heading">Password Reset</h3>
        <p className="form__heading">Enter your new password</p>

        {status === 'success' ? (
          <div className="form__notification" data-cy="form-success">
            Password has been updated. Try Logging in with your new password.
          </div>
        ) : null}

        {error ? (
          <div className="form__error" data-cy="form-error">
            {error}
          </div>
        ) : null}

        <fieldset className="form__field">
          <label className="form__label" htmlFor="password">
            <span className="form__labeling">Password</span>
            <input
              className="form__input form__input--text"
              data-cy="password"
              type="text"
              name="password"
              placeholder="Password"
              onChange={(evt) => setPassword(evt.target.value)}
              value={password}
            />
          </label>
        </fieldset>

        <button
          className="btn btn--submit"
          type="submit"
          disabled={status === 'sending'}
          data-cy="submit"
        >
          Reset Password
        </button>
      </form>
    </section>
  );
};

export default AccountReset;
