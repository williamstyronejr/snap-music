import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { ajaxRequest, isFileValid, genreList } from '../../utils/utils';
import {
  setNotification,
  setNotificationError,
} from '../../actions/notification';
import './styles/uploadPage.css';

/**
 * Removes a tag from a list and returns the new list of tags.
 * @param {String} tags String of tags separated by commas
 * @param {String} tag Tag to be removed
 * @return {String} Returns a string version of the tags separated by commas.
 */
function removeTag(tags, tag) {
  return tags
    .split(',')
    .filter((val) => val !== tag)
    .join(',');
}

const UploadPage = (props) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [title, setTitle] = React.useState('');
  const [genre, setGenre] = React.useState('');
  const [custom, setCustom] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [coverArt, setCoverArt] = React.useState(null);
  const [coverArtURL, setCoverArtURL] = React.useState(null);
  const [newTag, setNewTag] = React.useState('');
  const [redirect, setRedirect] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const fileRef = React.useRef();
  const coverArtRef = React.useRef();

  if (redirect) return <Redirect to={`/user/${props.user.username}`} />;

  const onSubmit = (evt) => {
    evt.preventDefault(); // Stop form from submitting
    setRequesting(true);

    const formData = new FormData();
    formData.append('track', file);
    formData.append('coverArt', coverArt);
    formData.append('title', title);
    formData.append('genre', genre === 'custom' ? custom : genre);
    formData.append('tags', tags);

    ajaxRequest('/upload/track', 'POST', {
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((res) => {
        setRequesting(false);
        if (res.data.success) setRedirect(true);
      })
      .catch((err) => {
        setRequesting(false);
        // Error with inputs and/or file
        if (err.response && err.response.status === 400) {
          return setErrors(err.response.data);
        }

        props.setNotificationError(
          'An error occurred during upload, please try again later.'
        );
      });
  };

  /**
   * Handles track file changes. Will set title to track name if title isn't set.
   * @param {Object} evt Event object
   */
  const onFileChange = (evt) => {
    const type = evt.target.name === 'track' ? 'audio' : 'image';

    if (evt.target.files.length === 0) return; //

    if (isFileValid(evt.target.files[0], type)) {
      if (evt.target.name === 'track') {
        if (title === '') setTitle(evt.target.files[0].name);
        setFile(evt.target.files[0]);
        return setErrors({ ...errors, track: undefined });
      }

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
    if (evt.target.name === 'track') {
      fileRef.current.value = null;
      setErrors({ ...errors, file: 'Invalid file' });
    } else {
      coverArtRef.current.value = null;
      setErrors({ ...errors, coverArt: 'Invalid file' });
    }
  };

  // Gets and set file data into state
  const onDragDrop = (evt) => {
    evt.preventDefault();
    setDragOver(false);
    let draggedFile;

    if (evt.dataTransfer.items) {
      draggedFile = evt.dataTransfer.items[0].getAsFile();
      evt.dataTransfer.items.clear();
    } else {
      [draggedFile] = evt.dataTransfer.files;
      evt.dataTransfer.clearData();
    }

    if (!draggedFile) return; // Do nothing if no file (drag over text)

    if (isFileValid(draggedFile, 'audio')) {
      if (title === '') setTitle(draggedFile.name);
      setFile(draggedFile);
      setErrors({ ...errors, track: null });
    } else {
      setErrors({ ...errors, track: 'Invalid file.' });
    }
  };

  const genreListItems = genreList.map((genreItem) => (
    <option key={genreItem.name} value={genreItem.name}>
      {genreItem.name}
    </option>
  ));

  return (
    <section className="upload">
      <form
        className="form"
        action="/upload/track"
        method="POST"
        encType="multipart/form-data"
      >
        <fieldset className="form__field">
          {errors.track ? (
            <span className="form__error" data-cy="error">
              {errors.track}
            </span>
          ) : null}

          <label
            className="form__label form__label--full form__label--center"
            htmlFor="track"
          >
            <div
              className={`field__drag ${dragOver ? 'field__drag--over' : ''}`}
              onDrop={onDragDrop}
              onDragOver={(evt) => evt.preventDefault()}
              onDragLeave={(evt) => setDragOver(false)}
              onDragEnter={() => setDragOver(true)}
            >
              <span className="form__labeling form__drag-child">
                Choose a file or Drag and Drop
              </span>

              <input
                className="form__input form__input--file"
                type="file"
                id="track"
                name="track"
                ref={fileRef}
                onChange={onFileChange}
              />
            </div>
            {file ? (
              <p className="form__drag-child">Selected Track: {file.name}</p>
            ) : null}
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="coverArt">
            {errors.coverArt ? (
              <span className="form__error" data-cy="error">
                {errors.coverArt}
              </span>
            ) : null}
            <span className="form__labeling">Cover Art</span>
            {coverArtURL ? (
              <img
                className="form__preview"
                alt="Preview of track cover"
                src={coverArtURL}
              />
            ) : null}

            <button
              type="button"
              className="btn btn--upload"
              onClick={(evt) => {
                evt.preventDefault();
                coverArtRef.current.click();
              }}
            >
              Change Cover Art
            </button>

            <input
              className="form__input form__input--file"
              type="file"
              name="coverArt"
              ref={coverArtRef}
              onChange={onFileChange}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="title">
            <span className="form__labeling">Title</span>
            {errors.title ? (
              <span className="form__error" data-cy="error">
                {errors.title}
              </span>
            ) : null}
            <input
              className="form__input form__input--text"
              type="text"
              name="title"
              value={title}
              onChange={(evt) => setTitle(evt.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="form__field">
          <label className="form__label" htmlFor="tags">
            <span className="form__labeling">Tags</span>
            {errors.tags ? (
              <span className="form__error" data-cy="error">
                {errors.tags}
              </span>
            ) : null}

            <ul className="form__list">
              {tags.split(',').map((tag) => {
                if (tag === '') return null;
                return (
                  <li className="form__item" key={tag}>
                    {tag}
                    <button
                      className="btn btn--close"
                      type="button"
                      onClick={() => setTags(removeTag(tags, tag))}
                    >
                      X
                    </button>
                  </li>
                );
              })}
            </ul>

            <input
              className="form__input form__input--text"
              type="text"
              name="tags"
              value={newTag}
              onChange={(evt) => setNewTag(evt.target.value)}
              onKeyUp={(evt) => {
                if (evt.key === 'Enter') {
                  // Check if tags contains new tag
                  if (newTag !== '' && !tags.split(',').includes(newTag))
                    setTags(`${tags},${newTag}`);
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
              <span className="form__error" data-cy="error">
                {errors.genre}
              </span>
            ) : null}
            <select
              name="genre"
              className="form__input form__input--select"
              onChange={(evt) => setGenre(evt.target.value)}
              defaultValue=""
            >
              <option disabled value="">
                Select a genre
              </option>
              {genreList}
              <option value="custom">Custom</option>
            </select>
          </label>

          {genre === 'custom' && (
            <input
              name="custom"
              type="text"
              className="form__input form__input--text"
              value={custom}
              onChange={(evt) => setCustom(evt.target.value)}
            />
          )}
        </fieldset>

        <button
          className="btn btn--submit"
          data-cy="submit"
          type="button"
          disabled={requesting}
          onClick={onSubmit}
        >
          <i className={`${requesting ? 'fa fa-spinner fa-spin' : ''}`} />
          {requesting ? ' Uploading' : ' Upload Track'}
        </button>

        <button
          type="button"
          className="btn btn--cancel"
          disabled={requesting}
          onClick={() => setRedirect({ redirect: true })}
        >
          Cancel
        </button>
      </form>
    </section>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setNotification: (msg) => dispatch(setNotification(msg)),
  setNotificationError: (msg) => dispatch(setNotificationError(msg)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);
