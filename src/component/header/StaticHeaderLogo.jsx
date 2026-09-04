import ImageFb from "../../elements/ui/media/ImageFb";

const StaticHeaderLogo = () => (
  <header className="static-logo-header">
    <a className="static-logo-header__link" href="/" aria-label="Go to homepage">
      <ImageFb
        className="static-logo-header__image"
        eager
        src="/assets/images/logo/logo.webp"
        fallback="/assets/images/logo/logo.jpg"
        fetchPriority="high"
        alt="Bulgarian Society Netherlands"
      />
    </a>
  </header>
);

export default StaticHeaderLogo;
