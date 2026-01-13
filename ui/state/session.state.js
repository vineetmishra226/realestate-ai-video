/**
 * Simple in-memory session state
 * Can be replaced with Redis / DB later
 */

const state = {};

function set(key, value) {
  state[key] = value;
}

function get(key) {
  return state[key];
}

function all() {
  return state;
}

module.exports = {
  set,
  get,
  all
};
