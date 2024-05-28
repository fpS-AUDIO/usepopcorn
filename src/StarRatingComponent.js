import { useState } from "react";

// ----- STYLES OBJECTS:

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1.6rem",
};

const starContainerStyle = {
  display: "flex",
};

/* creating reusable component which:
 -  'numStars' accept number of stars argument in form of a prop (default is 5)
 -  'onSetRating' is optional prop which can accept a function to set rating of a parent component
 -  'colorStars' is optional prop to set the color of stars
 -  'colorText' is optional prop to set the color of text
 -  'starSize' is optional prop to set the size of stars in REM (default is 3.6)
*/

export default function StarRating({
  numStars = 5,
  onSetRating = () => {},
  colorStars = "#fcc450",
  colorText = "#fcc450",
  starSize = 3.6,
}) {
  const [rating, setRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  function handleSetRating(newRating) {
    setRating(newRating);
    onSetRating(newRating);
  }

  const textStyle = {
    lineHeight: "1",
    margin: "0",
    color: `${colorText}`,
    fontSize: `${starSize / 1.5}rem`,
  };

  return (
    <div style={containerStyle}>
      <div style={starContainerStyle}>
        {Array.from({ length: numStars }, (_, indx) => (
          // passing callback function as a prop (onRating) to update the rating on click
          // also passing the boolean value to conditionally render stars (empty or full)
          <Star
            key={indx + 1}
            onRating={() => handleSetRating(indx + 1)}
            isFull={tempRating ? tempRating >= indx + 1 : rating >= indx + 1}
            onHoverIn={() => setTempRating(indx + 1)}
            onHoverOut={() => setTempRating(0)}
            colorStars={colorStars}
            starSize={starSize}
          />
        ))}
      </div>

      {/* just show the first true or the last one value */}
      <p style={textStyle}>{tempRating || rating || ""}</p>
    </div>
  );
}

function Star({
  onRating,
  isFull,
  onHoverIn,
  onHoverOut,
  colorStars,
  starSize,
}) {
  const starStyle = {
    display: "inline-block",
    width: `${starSize}rem`,
    height: `${starSize}rem`,
    cursor: "pointer",
  };

  return (
    <span
      style={starStyle}
      onClick={onRating}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      {/* conditionally rendering stars basing on boolean prop (isFull) */}
      {isFull ? (
        // if isFull is 'true' then use svg with full star
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={colorStars}
          stroke={colorStars}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        // if isFull is 'false' then use svg with empty star
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke={colorStars}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="{2}"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </span>
  );
}

// ----- SVG:

/* FULL STAR
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  fill="#000"
  stroke="#000"
>
  <path
    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
  />
</svg>


EMPTY STAR

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="#000"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="{2}"
    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  />
</svg>

*/
