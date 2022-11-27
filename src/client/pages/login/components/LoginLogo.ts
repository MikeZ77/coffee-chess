import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
// @ts-ignore
import TempLoginLogo from '../../../public/images/coffee_temp_logo.png';

const { div, img } = hh(h);

const LoginLogo = () => {
  return div({ className: 'columns is-centered' }, [
    div({ className: 'column has-text-centered' }, [
      img({
        src: TempLoginLogo,
        alt: 'Coffee Chess',
        width: '300',
        height: '300'
      })
    ])
  ]);
};

export default LoginLogo;
