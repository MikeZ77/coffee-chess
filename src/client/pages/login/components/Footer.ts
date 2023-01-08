import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';

const { div, footer, button, p, a, i, span } = hh(h);

const LoginFooter = () => {
  // TODO: Change color to light black and font to white and fix formatting
  return footer({ className: 'footer' }, [
    div({ className: 'content has-text-centered' }, [
      span({ className: 'has-text-weight-semibold' }, [
        p('Coffee Chess ', []),
        a(
          { href: 'https://github.com/MikeZ77/coffee-chess/blob/main/LICENSE' },
          '[MIT License]'
        ),
        button(
          {
            className: 'button',
            onclick: () => {
              window.open('https://github.com/MikeZ77/coffee-chess');
            }
          },
          [
            span({ className: 'icon is-small' }, [i({ className: 'fab fa-github' })]),
            span('GitHub')
          ]
        )
      ])
    ])
  ]);
};

export default LoginFooter;
