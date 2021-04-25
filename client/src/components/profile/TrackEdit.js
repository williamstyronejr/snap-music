import * as React from 'react';
import PropTypes from 'prop-types';
import { ajaxRequest, isFileValid, genreList } from '../../utils/utils';

import '../shared/styles/track.css';

const TrackEdit = ({
  id,
  initialTitle = '',
  initialCoverArt = '',
  initialExplicit = '',
  initialTags = '',
  initialGenre = '',
  onSave,
  onCancel,
}) => {
  // Flag to determine if the track's genre is custom or not
  const isCustomGenre = !genreList.some(
    (genre) => genre.toLowerCase() === initialGenre
  );

  const fileRef = React.useRef();
  const [title, setTitle] = React.useState(initialTitle);
  const [coverArt, setCoverArt] = React.useState(null);
  const [coverArtUrl, setCoverArtURL] = React.useState(null);
  const [explicit, setExplicit] = React.useState(initialExplicit);
  const [tags, setTags] = React.useState(initialTags);
  const [newTag, setNewTag] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [genre, setGenre] = React.useState(
    isCustomGenre ? 'custom' : initialGenre
  );
  const [custom, setCustom] = React.useState(isCustomGenre ? initialGenre : '');

  /**
   * Filters out the tag from the tags string.
   * @param {String} tag Tag to be removed
   */
  function removeTag(tag) {
    setTags(
      tags
        .split(',')
        .filter((val) => val !== tag)
        .join(',')
    );
  }

  /**
   * Handles track file changes. Will set title to track name if title isn't set.
   * @param {Object} evt Event object
   */
  const onFileChange = (evt) => {
    if (evt.target.files.length === 0) return; //

    if (isFileValid(evt.target.files[0], 'image')) {
      const fileReader = new FileReader();
      setCoverArt(evt.target.files[0]);

      // Read in file locally to display it to user
      fileReader.onload = (e) => {
        setCoverArtURL(e.target.result);
      };
      fileReader.readAsDataURL(evt.target.files[0]);
      return setErrors({ ...errors, coverArt: undefined });
    }

    // Set error for file
    fileRef.current.value = null;
    setErrors({ ...errors, coverArt: 'Invalid file' });
  };

  /**
   * Sends a request with the data to update the track. On success, will update
   *  locally and close edit menu.
   * @param {Object} evt Form event
   */
  function onSubmit(evt) {
    evt.preventDefault();

    const data = new FormData();
    data.append('trackId', id);
    if (title !== initialTitle) data.append('title', title);
    if (tags !== initialTags) data.append('tags', tags);
    if (explicit !== initialExplicit) data.append('explicit', explicit);
    if (coverArt) data.append('coverArt', coverArt);

    if (genre === 'custom') {
      data.append('genre', custom);
    } else if (genre !== initialGenre) {
      data.append('genre', genre);
    }

    ajaxRequest('/user/track/update', 'POST', {
      headers: { 'content-type': 'mutlipart/form-data' },
      data,
    })
      .then((res) => {
        if (res.data.success) {
          setErrors({});
          onCancel();
          return onSave(res.data.params);
        }

        onCancel();
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          return setErrors(err.response.data);
        }

        onCancel('An error occurred when updating, please try again.');
      });
  }

  const genreListItems = genreList.map((genreItem) => (
    <option key={genreItem} value={genreItem.toLowerCase()}>
      {genreItem}
    </option>
  ));

  return (
    <div className="track track--edit">
      <form className="form" method="POST" action="/user/track/update">
        <fieldset className="form__field">
          <label className="form__label" htmlFor="coverArt">
            <span className="form__labeling">Cover Art</span>
            <button
              type="button"
              className="btn"
              onClick={() => fileRef.current.click()}
            >
              <img
                className="track__cover track__cover--full track__cover--interactive"
                src={coverArtUrl || initialCoverArt}
                alt="Track cover art"
              />
            </button>

            <input
              type="file"
              ref={fileRef}
              className="form__input--file"
              name="coverArt"
              accept="image/jpeg,image/png"
              onChange={onFileChange}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="title">
            <span className="form__labeling">Title</span>

            {errors.title ? (
              <span className="form__error">{errors.title}</span>
            ) : null}

            <input
              className="form__input form__input--text"
              name="title"
              type="text"
              onChange={(evt) => setTitle(evt.target.value)}
              value={title}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <span className="form__labeling">Tags</span>
          <ul className="form__list">
            {tags.split(',').map((tag) => {
              if (tag === '') return null;
              return (
                <li className="form__item" key={tag}>
                  {tag}
                  <button
                    className="btn btn--close"
                    type="button"
                    onClick={() => removeTag(tag)}
                  >
                    X
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="track__label" htmlFor="tags">
            <input
              name="tags"
              className="form__input form__input--text"
              type="text"
              value={newTag}
              onChange={(evt) => setNewTag(evt.target.value)}
              onKeyUp={(evt) => {
                if (evt.key === 'Enter') {
                  // Check if tags contains new tag
                  if (newTag !== '' && !tags.split(',').includes(newTag))
                    setTags(`${tags === '' ? newTag : `${tags},${newTag}`}`);
                  setNewTag('');
                }
              }}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="genre">
            <span className="form__labeling">Genre</span>

            {errors.genre ? (
              <span className="form__error">{errors.genre}</span>
            ) : null}

            <select
              className="form__input form__input--select"
              name="genre"
              onChange={(evt) => setGenre(evt.target.value)}
              defaultValue={genre}
            >
              {genreListItems}
              <option value="custom">Custom</option>
            </select>

            {genre === 'custom' && (
              <input
                name="custom"
                type="text"
                className="form__input form__input--text"
                value={custom}
                onChange={(evt) => setCustom(evt.target.value)}
              />
            )}
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="explicit">
            <div className="form__indent">
              <input
                type="checkbox"
                id="explicit"
                name="explicit"
                className="form__input form__input--checkbox"
                onChange={(evt) => setExplicit(evt.target.checked)}
                checked={explicit}
              />
              <span className="form__labeling form__labeling--inline form__labeling--checkbox">
                Explicit
              </span>
            </div>
          </label>
        </fieldset>

        <button className="btn btn--submit" type="button" onClick={onSubmit}>
          Save
        </button>

        <button
          className="btn btn--cancel"
          type="button"
          onClick={() => onCancel()}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

TrackEdit.propTypes = {
  id: PropTypes.string.isRequired,
  initialTitle: PropTypes.string.isRequired,
  initialCoverArt: PropTypes.string.isRequired,
  initialTags: PropTypes.string.isRequired,
  initialGenre: PropTypes.string.isRequired,
  initialExplicit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TrackEdit;
