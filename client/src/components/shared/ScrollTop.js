import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Needs to scroll on main since its only scrollable (overflow-y) element.
    document.querySelector('#main').scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Just in case for future proof on design changes
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}
