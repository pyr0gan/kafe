import React from 'react';

const RightSidebar = ({ children }) => {
  return (
    <div className="dark:bg-kafedarker bg-kafelighter rounded-2xl ml-10 text-sm max-w-[400px] h-fit">
      {children}
    </div>
  );
};

export default RightSidebar;
