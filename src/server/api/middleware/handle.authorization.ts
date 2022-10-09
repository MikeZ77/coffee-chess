import {
  decodeToken,
  checkExpiration,
  TokenState
} from '../../utils/auth.token';

export default (req, res, next) => {
  const token = req.cookies.access_token;
  console.log(token);

  if (token === 'undefined') {
    return res.status(401).send('Unauthorized.');
  }

  const decodedToken = decodeToken(token);
  console.log(decodedToken);

  const authAction = checkExpiration(decodedToken);
  console.log(authAction);

  switch (authAction) {
    case TokenState.ACTIVE:
  }

  return res.status(401).send('Unauthorized.');
};
