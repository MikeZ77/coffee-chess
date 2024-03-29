export { default as health } from './health/health';
export { default as loginPage } from './pages/login';
export { default as registerPage } from './pages/register';
export { default as gameLobbyPage } from './pages/game.lobby';
export { default as register } from './user/register';
export { default as activate } from './user/activate';
export { default as login } from './user/login';
export { default as logout } from './user/logout';
export { default as queueSearch } from './game/queue.search';
export { default as queueSearchCancel } from './game/queue.search.cancel';

// Kept for automated testing of user auth to protected endpoints.
export { default as test } from './user/test';
