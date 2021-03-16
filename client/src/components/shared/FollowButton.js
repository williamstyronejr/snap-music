import * as React from 'react';
import PropsTypes from 'prop-types';

const FollowButton = (props) => {
  const [text, setText] = React.useState('Following');

  return (
    <button
      className={`btn ${props.className}`}
      onClick={(evt) => {
        props.onClick(evt);
      }}
      onMouseEnter={() => {
        if (props.isFollowing) setText('Unfollow');
      }}
      onMouseLeave={() => {
        if (props.isFollowing) setText('Following');
      }}
      data-cy="follow"
    >
      {props.isFollowing ? text : 'Follow'}
    </button>
  );
};

FollowButton.defaultProps = {
  isFollowing: false,
  className: '',
};

FollowButton.propTypes = {
  onClick: PropsTypes.func.isRequired,
  isFollowing: PropsTypes.bool,
  className: PropsTypes.string,
};

export default FollowButton;
