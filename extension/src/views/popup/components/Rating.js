import { useCallback, useMemo, useState } from "react";
import { Icon, Icons } from "../icons";

function Rating({
  // !multiselect: value is a number
  // multiselect: value is array of selected ratings
  value,
  // onChange function argument mimics event type
  onChange = ({ target: { value } }) => {},
  extended = false,
  multiselect = false,
  disabled = false,
}) {
  const [rating, setRating] = useState(value);

  // build array of icons to render
  const icons = useMemo(() => {
    const a = [];
    extended && a.push(Icons.STAR4);
    for (let i = 1; i <= 5; i++) a.push(Icons.STAR5);
    extended && a.push(Icons.STAR6);
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

  /** on clicking index'th icon, call onChange with new value */
  function updateRating(index) {
    if (disabled) return;

    if (!multiselect) {
      onChange({ target: { value: index } });
      setRating(index);
      return;
    }

    // toggle value
    const newRating = rating.includes(index)
      ? rating.filter((val) => val !== index)
      : [...rating, index];

    onChange({ target: { value: newRating } });
    setRating(newRating);
  }

  return (
    <div className={"rating"}>
      {icons.map((icon, index) => {
        return (
          <Icon
            icon={icon}
            size={20}
            className={disabled ? " disabled" : ""}
            type={indexSelected(index) ? Icons.FILL : Icons.STROKE}
            onClick={() => updateRating(index)}
          />
        );
      })}
    </div>
  );
}

export default Rating;
