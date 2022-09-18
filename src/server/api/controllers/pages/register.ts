import path from 'path';

export default (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/register.html'));
};
