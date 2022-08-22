import callAll from './callAll';

describe('callAll', () => {
  it('should call all functions', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    callAll(fn1, fn2, fn3)('args');

    expect(fn1).toHaveBeenCalledWith('args');
    expect(fn2).toHaveBeenCalledWith('args');
    expect(fn3).toHaveBeenCalledWith('args');
  });
});
