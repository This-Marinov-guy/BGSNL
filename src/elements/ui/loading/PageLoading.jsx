import React from "react";
import ImageFb from "../media/ImageFb";

const PageLoading = () => {
  return (
    <div className="center_screen">
      <ImageFb
        className="logo"
        src="/assets/images/logo/logo.webp"
        fallback="/assets/images/logo/logo.jpg"
        alt="Logo"
      />
      <h3>Loading...</h3>
    </div>
  );
};

export default PageLoading;

// TODO: needs optimization in order to be implemented
// import React from "react";
// import ImageFb from "../media/ImageFb";

// const PageLoading = () => {
//   return (
//     <div className="center_screen">
//       <video
//         className="logo"
//         src="/assets/images/logo/loading-logo.mp4"
//         autoPlay
//         muted
//         loop
//         alt="Logo"
//       />
//       <h3>Loading...</h3>
//     </div>
//   );
// };

// export default PageLoading;
