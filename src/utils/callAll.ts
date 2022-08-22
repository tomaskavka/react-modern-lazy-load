/* eslint-disable @typescript-eslint/ban-ts-comment */
type FnType = (() => void) | undefined;

const callAll =
  (...fns: FnType[]) =>
    (...args: unknown[]) =>
      // @ts-ignore
      fns.forEach(fn => fn && fn(...args));

export default callAll;
