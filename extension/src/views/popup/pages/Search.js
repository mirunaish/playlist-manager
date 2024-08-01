import React from "react";
import Button from "../components/Button";
import { useStatusUpdate } from "../hooks";
import Banner from "../components/Banner";

function Search() {
  const updateStatus = useStatusUpdate();

  return (
    <div>
      <Banner />

      <Button
        title="search"
        // onClick={save}
      />
    </div>
  );
}

export default Search;
