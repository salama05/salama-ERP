import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-neutral-800 rounded-xl shadow-light dark:shadow-md p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
