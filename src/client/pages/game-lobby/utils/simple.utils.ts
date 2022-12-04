interface Tooltip {
  [key: string]: string;
}

export const initTooltipAttributes = (tooltipInfo: Tooltip): void => {
  for (const [id, message] of Object.entries(tooltipInfo)) {
    const element = document.getElementById(id);
    element?.setAttribute('data-tooltip', message);
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
