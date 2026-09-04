"use client";

import { PrimeReactProvider, PrimeReactStyleSheet } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import { useServerInsertedHTML } from "next/navigation";
import PropTypes from "prop-types";

const stylesheet = new PrimeReactStyleSheet();

export default function PrimeSSRProvider({ children }) {
  useServerInsertedHTML(() => {
    const styles = stylesheet.getAllElements();
    stylesheet.clear();
    return <>{styles}</>;
  });

  return (
    <PrimeReactProvider
      license={process.env.NEXT_PUBLIC_PRIMEUI_LICENSE}
      theme={{
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      }}
      stylesheet={stylesheet}
    >
      {children}
    </PrimeReactProvider>
  );
}

PrimeSSRProvider.propTypes = {
  children: PropTypes.node,
};
