import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  createRef,
} from "react";
import { useCallbackRef } from "use-callback-ref";

const SvgConnectingLine = ({ element1, element2 }) => {
  if (!(element1 && element2)) {
    return "";
  }
  const stroke = 8;
  const element1_right_x = element1.offsetLeft + element1.offsetWidth;
  const element1_halfHeight_y = element1.offsetTop + element1.offsetHeight / 2;

  const element2_left_x = element2.offsetLeft;
  const element2_halfHeight_y = element2.offsetTop + element2.offsetHeight / 2;

  const distance_between_boxes = Math.abs(element2_left_x - element1_right_x);

  // line 1
  const line1_x1 = element1_right_x;
  const line1_y1 = element1_halfHeight_y;
  const line1_x2 = line1_x1 + distance_between_boxes / 2;
  const line1_y2 = element1_halfHeight_y;

  // line  2
  const line2_x1 = line1_x2;
  const line2_y1 = line1_y2;
  const line2_x2 = element2_left_x - distance_between_boxes / 2;
  const line2_y2 = element2_halfHeight_y;

  // line 3
  const line3_x1 = line2_x2;
  const line3_y1 = line2_y2;
  const line3_x2 = element2_left_x;
  const line3_y2 = element2_halfHeight_y;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <g>
        <path
          d={`
            M ${line1_x1} ${line1_y1}
            L${line1_x2}, ${line1_y2}
            L${line2_x2}, ${line2_y2}
            L${line3_x2}, ${line3_y2}
          `}
          fill="transparent"
          stroke="black"
        />
      </g>
    </svg>
  );
};

const generateGrid = (matches) => {
  let power = Math.log(matches.length + 1) / Math.log(2) - 1;
  const grid = [];
  const reversedMatches = matches.map((m) => ({ ...m })).reverse();
  while (power >= 0) {
    const numberOfElementsToSplice = 2 ** power;
    const splicedMatches = reversedMatches.splice(0, numberOfElementsToSplice);
    grid.push(splicedMatches);
    power--;
  }

  return grid;
};

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

const getHeight = () =>
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

const TournamentBracket = ({ matches, matchClick }) => {
  let [width, setWidth] = useState(getWidth());
  let [height, setHeight] = useState(getHeight());
  const [elRefs, setElRefs] = useState([]);

  useEffect(() => {
    setElRefs((elRefs) => {
      return new Array(matches.length)
        .fill()
        .map((_, i) => elRefs[i] || createRef());
    });
  }, [matches.length]);

  useEffect(() => {
    const resizeListener = () => {
      // change width from the state object
      setWidth(getWidth());
      setHeight(getHeight());
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  if (!matches || matches.length < 1) return null;
  const grid = generateGrid(matches);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        gap: "10px",
      }}
    >
      {grid.map((column) => {
        return (
          <div
            key={Math.random()}
            style={{
              width: `${100 / grid.length}%`,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {column.map((match) => {
              const { matchId } = match;
              return (
                <div
                  className="tournament-match"
                  onClick={() => matchClick(match)}
                  key={matchId}
                  ref={(ref) => {
                    elRefs[match.index] = ref;
                  }}
                  id={`match${match.index}`}
                  style={{
                    height: 90,
                    width: 180,
                    border: "3px solid",
                  }}
                >
                  <pre>{JSON.stringify(match, null, 2)}</pre>
                </div>
              );
            })}
          </div>
        );
      })}
      {matches.map((match) => {
        if (match.index === 0) return "";
        const selfRef = elRefs[match.index] || {};
        const parentRef = elRefs[match.parentIndex] || {};

        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <SvgConnectingLine
              key={selfRef}
              element1={selfRef}
              element2={parentRef}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TournamentBracket;
