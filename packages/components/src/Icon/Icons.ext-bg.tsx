/* eslint-disable */

const icons = new Proxy({}, {
  get: function() {
    return () => null
  },
});
export type IICON_NAMES = keyof typeof icons;
export default icons;
