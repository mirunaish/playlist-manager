import React from "react";
import Button from "../components/Button";
import Banner from "../components/Banner/Banner";

function Search() {
  return (
    <div className="page">
      <Banner />

      <Button
        primary
        title="search"
        // onClick={save}
      />
    </div>
  );
}

export default Search;
