import React from 'react';
import tw from 'tailwind-styled-components';

const Wrapper = ({ children }) => {
  const StyledDiv = tw.div`
  lg:px-2
  pt-0
  mx-auto
  lg:max-w-[1400px]
  w-full
  bg-kafewhite
  dark:bg-kafeblack
  relative
    `;

  return <StyledDiv>{children}</StyledDiv>;
};

export default Wrapper;
