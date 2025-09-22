import { useMemo } from "react";
import { GRADIENT } from "../../../utils";

export const Stars = {
  4: {
    viewBox: "0 0 190 190",
    path: "M91.3753 2.76659C92.8117 -0.31122 97.1883 -0.311208 98.6247 2.7666L126.205 61.8622C126.602 62.7136 127.286 63.3979 128.138 63.7953L187.233 91.3753C190.311 92.8117 190.311 97.1883 187.233 98.6247L128.138 126.205C127.286 126.602 126.602 127.286 126.205 128.138L98.6247 187.233C97.1883 190.311 92.8117 190.311 91.3753 187.233L63.7953 128.138C63.3979 127.286 62.7136 126.602 61.8622 126.205L2.76659 98.6247C-0.31122 97.1883 -0.311208 92.8117 2.7666 91.3753L61.8622 63.7953C62.7136 63.3979 63.3979 62.7136 63.7953 61.8622L91.3753 2.76659Z",
  },
  5: {
    viewBox: "0 0 180 171",
    path: "M86.3067 2.87972C87.6731 -0.405453 92.3269 -0.405456 93.6933 2.87971L115.512 55.3384C116.088 56.7233 117.391 57.6696 118.886 57.7895L175.519 62.3298C179.066 62.6141 180.504 67.0401 177.802 69.3548L134.653 106.316C133.514 107.292 133.016 108.823 133.364 110.282L146.547 165.547C147.373 169.008 143.608 171.743 140.571 169.889L92.085 140.274C90.805 139.492 89.195 139.492 87.915 140.274L39.4288 169.889C36.3924 171.743 32.6274 169.008 33.4529 165.547L46.6356 110.282C46.9836 108.823 46.4861 107.292 45.347 106.316L2.19817 69.3548C-0.503974 67.0401 0.934128 62.6141 4.48074 62.3298L61.1143 57.7895C62.6095 57.6696 63.9119 56.7233 64.4879 55.3384L86.3067 2.87972Z",
  },
  6: {
    viewBox: "0 0 162 186",
    path: "M77.2469 3.17977C78.5331 -0.308668 83.4669 -0.308663 84.7531 3.17978L102.349 50.9061C103.016 52.7157 104.879 53.7916 106.78 53.4645L156.91 44.8396C160.574 44.2092 163.041 48.4821 160.663 51.3401L128.129 90.4416C126.895 91.9242 126.895 94.0758 128.129 95.5584L160.663 134.66C163.041 137.518 160.574 141.791 156.91 141.16L106.78 132.535C104.879 132.208 103.016 133.284 102.349 135.094L84.7531 182.82C83.4669 186.309 78.5331 186.309 77.2469 182.82L59.6513 135.094C58.9841 133.284 57.1207 132.208 55.22 132.535L5.08993 141.16C1.4258 141.791 -1.04115 137.518 1.33687 134.66L33.8713 95.5584C35.1048 94.0758 35.1048 91.9242 33.8713 90.4416L1.33687 51.3401C-1.04115 48.4821 1.4258 44.2092 5.08993 44.8396L55.22 53.4645C57.1207 53.7916 58.9841 52.7157 59.6513 50.9061L77.2469 3.17977Z",
  },
  FILL: "fill",
  STROKE: "stroke",
};

export function Star({
  points = 5, // 4, 5, or 6
  size = 20,
  type = Stars.FILL, // or Stars.STROKE
  color = "", // primary, secondary, or rainbow
  gradientOffset = 0, // by how many degrees to offset the rainbow gradient
  className = "",
  ...args
}) {
  const { viewBox, path } = Stars[points];

  // calculate gradient stops
  const gradientStops = useMemo(() => {
    const stops = [];

    for (let i = 0; i < GRADIENT.gradientQuality; i++) {
      const initialHue =
        (gradientOffset +
          (i * GRADIENT.rainbowDegrees) / GRADIENT.gradientQuality) %
        360;

      // calculate colors this color will loop through: entire rainbow, starting at initialHue
      const animatedColors = [];
      for (let j = 0; j <= GRADIENT.animationQuality; j++) {
        const hue = (initialHue - (j * 360) / GRADIENT.animationQuality) % 360;
        animatedColors.push(`hsl(${hue}, 100%, 50%)`);
      }
      const offset = Math.floor((i * 100) / (GRADIENT.gradientQuality - 1));
      stops.push({
        offset: offset + "%",
        color: `hsl(${initialHue}, 100%, 50%)`,
        animatedColors,
      });
    }
    return stops;
  }, [gradientOffset]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      {...args}
      width={size}
      height={size}
      className={"icon star " + type + " " + color + " " + className}
    >
      <defs>
        <linearGradient
          id={`rainbowGradient${gradientOffset}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="60%"
        >
          {gradientStops.map((stop, index) => (
            <stop
              key={index}
              offset={stop.offset}
              style={{ stopColor: stop.color }}
            >
              <animate
                attributeName="stop-color"
                values={stop.animatedColors.join(";")}
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
          ))}
        </linearGradient>
      </defs>

      <path
        d={path}
        style={
          color === "rainbow"
            ? { fill: `url(#rainbowGradient${gradientOffset})` }
            : {}
        }
      />
    </svg>
  );
}
