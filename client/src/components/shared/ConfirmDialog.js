import * as React from 'react';
import PropTypes from 'prop-types';
import './styles/confirmDialog.css';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="dialog">
    <div className="dialog__box">
      <p className="dialog__message">{message}</p>
      <button
        className="btn btn--dialog btn--dialog-confirm"
        type="button"
        data-cy="confirm"
        onClick={onConfirm}
      >
        Confirm
      </button>
      <button
        className="btn btn--dialog btn--dialog-cancel"
        type="button"
        data-cy="cancel"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  </div>
);

ConfirmDialog.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
