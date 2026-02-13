import Thumbnail from "../../components/Thumbnail/Thumbnail";
import LoadablePreviewInput from "./LoadablePreviewInput";
import "./LoadablePreviewInput.scss";

const MY_REQUESTER_ID = "LoadablePreviewImageInput";

function LoadablePreviewImageInput({ imageLink, setImageLink, tabId = null }) {
  return (
    <LoadablePreviewInput
      id={MY_REQUESTER_ID}
      attribute="imageLink"
      value={imageLink}
      onChange={(imageLink) => setImageLink(imageLink)}
      tabId={tabId}
      preview={(imageLink) => (
        <Thumbnail src={imageLink} square maxWidth={50} />
      )}
      placeholder="image url"
    />
  );
}

export default LoadablePreviewImageInput;
