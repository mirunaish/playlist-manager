import React, { useCallback } from "react";
import { Icons } from "../../icons";
import { FUNCTIONS, SupportedSites } from "../../../../utils";
import { background, closePopup } from "../../util";
import Button from "../../components/Button";
import "./SearchOtherSite.scss";

const SearchOtherSite = ({ artistString, title, url }) => {
  const search = useCallback(
    async (site) => {
      // background will open a new tab with the search
      await background(
        FUNCTIONS.searchOtherSite,
        artistString + " - " + title,
        site,
      );
      closePopup();
    },
    [artistString, title],
  );

  return (
    <div className="search-other-site-buttons">
      <p>Search for this track on:</p>
      {/* render buttons for sites except ones this track is on */}
      {Object.entries(SupportedSites).map(([site, { regex }]) => {
        return (
          <Button
            key={site}
            icon={{ icon: Icons[site.toUpperCase()], size: 20 }}
            onClick={() => search(site)}
          />
        );
      })}
    </div>
  );
};

export default SearchOtherSite;
