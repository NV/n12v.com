/**
 * Must be in sync with templates
 * @param {string} path
 * @return {string}
 */
function makeIdForPath(path) {
  if (path[0] === '/') {
    path = path.slice(1);
  }
  if (path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }
  path = path.replace(/[^a-z_-]/gi, '_');
  return 'article_' + path;
}
