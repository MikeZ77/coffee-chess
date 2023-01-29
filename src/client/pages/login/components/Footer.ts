import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';

const { div, footer, button, a, i, span } = hh(h);

const LoginFooter = () => {
  return footer(
    {
      className:
        'footer has-text-primary-light has-background-dark has-text-weight-semibold  py-6'
    },
    [
      div(
        {
          className: 'content has-text-centered'
        },
        [
          span({ className: 'pr-2' }, 'coffeechess is an opensource chess webserver'),
          a(
            {
              className: 'pr-2',
              href: 'https://github.com/MikeZ77/coffee-chess/blob/main/LICENSE',
              style: 'all: unset; cursor: pointer;'
            },
            '[MIT License]'
          ),
          button(
            {
              className: 'button is-small',
              onclick: () => {
                window.open('https://github.com/MikeZ77/coffee-chess');
              }
            },
            [
              span({ className: 'icon is-small' }, [i({ className: 'fab fa-github fa-xl' })]),
              span('GitHub')
            ]
          )
        ]
      )
    ]
  );
};

export default LoginFooter;
