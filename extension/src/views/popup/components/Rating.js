import { useCallback, useMemo, useState } from "react";
import { Star, Stars } from "../icons/Star";
import { GRADIENT } from "../../../consts";

function Rating({
  // !multiselect: value is a number
  // multiselect: value is array of selected ratings
  value,
  // onChange function argument mimics event type
  onChange = (value) => {},
  extended = false,
  multiselect = false,
  disabled = false,
  size = 20,
}) {
  const [rating, setRating] = useState(value ?? (multiselect ? [] : -1));

  // build array of icons to render
  const icons = useMemo(() => {
    const a = [];
    if (extended) a.push(4);
    for (let i = 1; i <= 5; i++) a.push(5);
    if (extended) a.push(6);
    return a;
  }, [extended]);

  /** should the icon at this index be colored in or not? */
  const indexSelected = useCallback(
    (i) => {
      return (
        (multiselect && rating.includes(i)) || (!multiselect && i <= rating)
      );
    },
    [multiselect, rating]
  );
  const isRainbow = useCallback(
    (i) =>
      (multiselect && i === 6 && indexSelected(i)) ||
      (!multiselect && indexSelected(6)),
    [indexSelected, multiselect]
  );

  /** on clicking index'th icon, call onChange with new value */
  function updateRating(index) {
    if (disabled) return;

    if (!multiselect) {
      onChange(index);
      setRating(index);
      return;
    }

    // toggle value
    const newRating = rating.includes(index)
      ? rating.filter((val) => val !== index)
      : [...rating, index];

    onChange(newRating);
    setRating(newRating);
  }

  return (
    <div className="rating">
      {icons.map((points, index) => {
        return (
          <Star
            key={index}
            points={points}
            type={indexSelected(index) ? Stars.FILL : Stars.STROKE}
            color={isRainbow(index) ? "rainbow" : "primary"}
            size={size}
            gradientOffset={(index * GRADIENT.rainbowDegrees * 0.6) % 360}
            className={disabled ? " disabled" : ""}
            style={{ cursor: disabled ? "default" : "pointer" }}
            onClick={() => updateRating(index)}
          />
        );
      })}
    </div>
  );
}

export default Rating;
