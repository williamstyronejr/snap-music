import * as React from 'react';

const useOutsideClick = ({
  active,
  closeEvent,
  ignoreButton = false,
  triggerKeys = ['Escape'],
}) => {
  const ref = React.useRef(null);

  const onClickEvent = React.useCallback(
    (evt) => {
      if (ref && ref.current) {
        if (!ref.current.contains(evt.target)) {
          if (ignoreButton) {
            if (evt.target.tagName !== 'BUTTON') closeEvent();
          } else {
            closeEvent();
          }
        }
      }
    },
    [ref.current, closeEvent]
  );

  const onKeyEvent = React.useCallback(
    (evt) => {
      if (triggerKeys.includes(evt.key)) {
        closeEvent();
      }
    },
    [ref.current, closeEvent]
  );

  const events = React.useMemo(
    () => [
      ['click', onClickEvent],
      ['keyup', onKeyEvent],
    ],
    [onClickEvent]
  );

  React.useLayoutEffect(() => {
    if (active || active === undefined) {
      events.map((config) => {
        const [eventName, handler] = config;
        window.addEventListener(eventName, handler);
      });

      return () => {
        events.map((config) => {
          const [eventName, handler] = config;
          window.removeEventListener(eventName, handler);
        });
      };
    }
  }, [events, active]);

  return ref;
};

export default useOutsideClick;
