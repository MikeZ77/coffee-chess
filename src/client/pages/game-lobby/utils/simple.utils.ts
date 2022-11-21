interface Tooltip {
  [key: string]: string;
}

export const initTooltipAttributes = (tooltipInfo: Tooltip): void => {
  for (const [id, message] of Object.entries(tooltipInfo)) {
    const element = document.getElementById(id);
    element?.setAttribute('data-tooltip', message);
  }
};
