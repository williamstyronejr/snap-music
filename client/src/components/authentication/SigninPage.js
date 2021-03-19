import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import { signin, setAuthError } from '../../actions/user';
import './styles/signinPage.css';

const SigninPage = (props) => {
  const [user, setUser] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Clear auth errors when demounting
  React.useEffect(() => {
    return () =>
      props.user.authenticationError ? props.setAuthError(null) : null;
  }, [props.user.authenticationError, props.setAuthError]);

  if (props.user.authenticated) {
    return <Redirect to="/chart" />;
  }

  return (
    <section className="signin">
      <form
        className="form"
        method="POST"
        onSubmit={(evt) => {
          evt.preventDefault();
          props.signin(user, password);
        }}
      >
        <header className="form__header">
          <h4 className="form__heading">Sign in to your account</h4>
        </header>

        {props.user.authenticationError && (
          <div className="form__error" data-cy="formError">
            <p>Invalid username or password. Please try again.</p>
          </div>
        )}

        <div className="form__field">
          <label className="form__label" htmlFor="user">
            <span className="form__title">Username</span>
            <input
              className="form__input"
              data-cy="user"
              name="user"
              type="text"
              placeholder="Username"
              value={user}
              onChange={(evt) => setUser(evt.target.value)}
            />
          </label>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="password">
            <span className="form__title">Password</span>
            <input
              className="form__input"
              data-cy="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
            />
          </label>
        </div>

        <button
          className="btn btn--submit"
          data-cy="submit"
          disabled={props.user.authenticating}
          type="submit"
        >
          {props.user.authenticating ? (
            <i className="fas fa-spinner fa-spin" />
          ) : null}{' '}
          Signin
        </button>

        <hr />
        <button
          type="button"
          className="btn btn--submit"
          onClick={() => {
            props.signin('guest', 'guest');
          }}
        >
          Signin as Guest
        </button>

        <span className="form__footnote">
          (Note: This is a shared account for demo purposes.)
        </span>
        <hr />

        <Link className="signin__forgot" to="/account/recovery">
          Forgot your password?
        </Link>
      </form>
    </section>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  signin: (user, password) => dispatch(signin(user, password)),
  setAuthError: (err) => dispatch(setAuthError(err)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SigninPage);
