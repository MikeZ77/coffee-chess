import tippy from 'tippy.js';

interface Tooltip {
  [key: string]: string;
}

export const initTooltipAttributes = (tooltipInfo: Tooltip): void => {
  for (const [id, message] of Object.entries(tooltipInfo)) {
    tippy(id, { content: message });
  }
};

export const initEventListeners = (): void => {
  document.getElementById('message-game-chat')?.addEventListener('keyup', (e) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      document.getElementById('button-game-chat')?.click();
    }
  });
};

export enum Sound {
  START = 'game-start.mp3',
  MOVE = 'piece-move.mp3',
  CLOCK = 'tic-toc.wav'
}

export const playSound = (file: Sound): void => {
  new Audio(file).play();
};
