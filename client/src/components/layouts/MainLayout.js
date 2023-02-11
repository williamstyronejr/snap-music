import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MediaPlayer from './MediaPlayer';
import Header from './Header';
import Aside from './Aside';

const MainLayout = (props) => {
  return (
    <div
      className={`layout layout-main ${
        props.user.nightMode ? 'layout-night' : ''
      } ${
        props.mediaPlayer.footer && props.mediaPlayer.playlist.length > 0
          ? 'layout--footer'
          : ''
      }`}
    >
      <div className="layout__wrapper">
        <Aside user={props.user} />

        <div className="page-content">
          <Header user={props.user} />

          <main className="page-main" role="main" id="main">
            {props.children}
          </main>
        </div>
      </div>
      <MediaPlayer />
    </div>
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
