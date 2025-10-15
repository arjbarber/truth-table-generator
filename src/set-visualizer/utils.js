import { PANEL } from './constants';

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const distance = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

export const isInsideCircle = (point, circle) =>
  distance(point.x, point.y, circle.cx, circle.cy) <= circle.r;

export const isInsidePanel = (point) =>
  point.x >= PANEL.x &&
  point.x <= PANEL.x + PANEL.width &&
  point.y >= PANEL.y &&
  point.y <= PANEL.y + PANEL.height;

export const isInsideRect = (point, rect) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export const formatSet = (items) => {
  if (!items.length) return '∅';
  return `{ ${items.join(', ')} }`;
};

export const combination = (n, k) => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - i + 1)) / i;
  }

  return Math.round(result);
};
