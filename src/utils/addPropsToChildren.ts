import React from 'react';

type PropsType = Record<string, unknown>;

const addPropsToChildren = (
  children: React.ReactElement,
  propsOrCallback: PropsType | ((child: React.ReactElement) => PropsType)
) => React.Children.map(children as React.ReactElement, (child) => {
  const newProps = (typeof propsOrCallback === 'function') ? propsOrCallback(child) : propsOrCallback;

  return React.cloneElement(child, newProps);
});

export default addPropsToChildren;
