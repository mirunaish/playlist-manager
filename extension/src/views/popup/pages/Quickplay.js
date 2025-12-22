import React, { useCallback, useEffect, useState } from "react";
import Banner from "../components/Banner";
import QuickplayCard from "../modules/QuickplayCard";
import { background } from "../util";
import { FUNCTIONS } from "../../../utils";

function Quickplay() {
  const [quickplay, setQuickplay] = useState([]);

  // ask background script for quickplay cards from database
  useEffect(() => {
    (async () => {
      // TODO
      // const quickplay = await background(FUNCTIONS.getQuickplay);
      // setQuickplay(
      //   quickplay ?? [
      //     { title: "test", theme: "BEACH", id: 1 },
      //     { title: "test", theme: "DARK_PINK", id: 2 },
      //     { title: "test", theme: "BLUEJAY", id: 3 },
      //     { title: "test", theme: "BLUEJAY", id: 4 },
      //     { title: "test", theme: "WATERMELON", id: 5 },
      //     { title: "test", theme: "BEACH", id: 6 },
      //     { title: "test", theme: "DARK_PINK", id: 7 },
      //   ] // TODO remove
      // );
    })();
  }, []);

  const play = useCallback(async (card) => {
    await background(
      FUNCTIONS.startPlaying,
      card.title,
      card.theme,
      card.filters
    );
  }, []);

  return (
    <div className="page">
      <Banner title="Quickplay" />

      <div
        style={{
          width: "100%",
          padding: "5px",
          boxSizing: "border-box",

          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {quickplay.map((card, index) => (
          <QuickplayCard
            id={card.id}
            key={index}
            title={card.title}
            theme={card.theme}
            onClick={() => play(card)}
          />
        ))}
      </div>
    </div>
  );
}

export default Quickplay;
