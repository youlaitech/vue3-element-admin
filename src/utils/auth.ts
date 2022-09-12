import Cookies from 'js-cookie';

const SESSION_ID_KEY = 'SCG_SESSION_ID';

export const hasLogin = () => {
  const sessionId = Cookies.get(SESSION_ID_KEY);
  console.log('sessionId', sessionId);
  if (sessionId) {
    return true;
  } else {
    return false;
  }
};
