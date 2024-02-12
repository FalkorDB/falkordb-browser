// components/CircleIcon.js
import React from 'react';

interface CircleIconProps {
    color: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({ color }) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color} 
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

export default CircleIcon;
