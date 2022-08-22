import React from 'react';
import addPropsToChildren from './addPropsToChildren';
import callAll from './callAll';

describe('addPropsToChildren', () => {
  it('should add props passed as object', () => {
    const children = [React.createElement('div', { initialProp: 'initialValue' })] as unknown as React.ReactElement;

    const childrenWithProps = addPropsToChildren(children, { prop: 'value' });

    expect(childrenWithProps).toHaveLength(1);
    expect(childrenWithProps[0].props.initialProp).toBe('initialValue');
    expect(childrenWithProps[0].props.prop).toBe('value');
  });

  it('should add props passed as callback', () => {
    const mockOnLoad1 = jest.fn();
    const mockOnLoad2 = jest.fn();

    const children = [React.createElement('div', { prop: 'value', onLoad: mockOnLoad1 })] as unknown as React.ReactElement;

    const childrenWithProps = addPropsToChildren(children, (child) => ({ onLoad: callAll(child.props.onLoad, mockOnLoad2) }));

    childrenWithProps[0].props.onLoad('args');

    expect(childrenWithProps[0].props.prop).toBe('value');
    expect(mockOnLoad1).toHaveBeenCalledWith('args');
    expect(mockOnLoad2).toHaveBeenCalledWith('args');
  });
});
