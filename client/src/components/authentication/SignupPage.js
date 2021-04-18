import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { signup, setAuthError } from '../../actions/user';
import './styles/signupPage.css';

const SignUpPage = (props) => {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  // Redirect if the user is already authenticated
  if (props.user.authenticated) return <Redirect to="/chart" />;

  // Clear any errors when demounting
  React.useEffect(() => {
    return () =>
      props.user.authenticationError ? props.setAuthError(null) : null;
  }, [props.user.authenticationError, props.setAuthError]);

  const onSubmit = (evt) => {
    evt.preventDefault();

    // validation
    props.signup(username, email, password, confirm);
  };

  return (
    <section className="signup" onSubmit={onSubmit}>
      <form className="form" method="POST">
        <header className="form__header">
          <h4 className="form__heading">Create your account</h4>
        </header>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="email">
            <span className="form__labeling">Email</span>
            {props.user.authenticationError &&
              props.user.authenticationError.email && (
                <span className="form__error" data-cy="error">
                  {props.user.authenticationError.email}
                </span>
              )}

            <input
              className="form__input form__input--text"
              data-cy="email"
              type="text"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="username">
            <span className="form__labeling">Username</span>
            {props.user.authenticationError &&
              props.user.authenticationError.username && (
                <span className="form__error" data-cy="error">
                  {props.user.authenticationError.username}
                </span>
              )}
            <input
              className="form__input form__input--text"
              data-cy="username"
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="password">
            <span className="form__labeling">Password</span>
            {props.user.authenticationError &&
              props.user.authenticationError.password && (
                <span className="form__error" data-cy="error">
                  {props.user.authenticationError.password}
                </span>
              )}
            <input
              className="form__input form__input--text"
              data-cy="password"
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="confirm">
            <span className="form__labeling">Confirm Password</span>
            {props.user.authenticationError &&
              props.user.authenticationError.confirm && (
                <span className="form__error" data-cy="error">
                  {props.user.authenticationError.confirm}
                </span>
              )}
            <input
              className="form__input form__input--text"
              data-cy="confirm"
              name="confirm"
              placeholder="Confirm Password"
              type="password"
              value={confirm}
              onChange={(evt) => setConfirm(evt.target.value)}
            />
          </label>
        </fieldset>

        <button
          className="btn btn--submit"
          data-cy="submit"
          type="submit"
          disabled={props.user.authenticating}
        >
          {props.user.authenticating ? (
            <i className="fas fa-spinner fa-spin spinner-space" />
          ) : null}
          Signup
        </button>
      </form>
    </section>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  signup: (username, email, password, confirm) =>
    dispatch(signup(username, email, password, confirm)),
  setAuthError: (err) => dispatch(setAuthError(err)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage);
