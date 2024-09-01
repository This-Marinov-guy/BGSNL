import React, { useEffect, useState } from 'react';

const TypewriterEffect = ({ text, speed = 100 }) => {
    const [typedText, setTypedText] = useState('');
    const [index, setIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypedText((prev) => prev + text.charAt(index));
          setIndex((prevIndex) => prevIndex + 1);
        } else {
          clearInterval(interval);
        }
      }, speed);
  
      return () => clearInterval(interval);
    }, [index, text, speed]);
  
    const cursorStyle = {
      animation: 'blink 1s step-end infinite',
    };
  
    return (
      <h1 className="typed-text">
        {typedText}
        <span
          className="cursor"
          style={cursorStyle}
        >|</span>
  
        {/* Inline style for keyframes on blinking cursor */}
        <style>
          {`
            @keyframes blink {
              0% { opacity: 1; }
              50% { opacity: 0; }
              100% { opacity: 1; }
            }
            .cursor {
              animation: blink 1s step-end infinite;
            }
          `}
        </style>
      </h1>
    );
  };

export default TypewriterEffect;