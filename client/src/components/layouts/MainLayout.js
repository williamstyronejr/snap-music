import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NotificationContainer from './NotificationContainer';
import MediaPlayer from './MediaPlayer';
import Header from './Header';

const MainLayout = (props) => {
  return (
    <>
      <div
        className={`layout layout-main ${
          props.user.nightMode ? 'layout-night' : ''
        } ${
          props.mediaPlayer.footer && props.mediaPlayer.playlist.length > 0
            ? 'layout--footer'
            : ''
        }`}
      >
        <Header user={props.user} />
        <NotificationContainer />
        <main className="page-main" role="main">
          {props.children}
        </main>
        <MediaPlayer />
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  mediaPlayer: state.mediaPlayer,
});

MainLayout.propTypes = {
  children: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  mediaPlayer: PropTypes.shape({
    footer: PropTypes.bool,
    playlist: PropTypes.array,
  }).isRequired,
};

export default connect(mapStateToProps)(MainLayout);
