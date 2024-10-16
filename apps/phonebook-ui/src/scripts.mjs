import { adsense, googleTagManager } from "/configs/values.js";

if (googleTagManager) {
  import(`https://www.googletagmanager.com/gtag/js?id=${googleTagManager}`)
    .then(() => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", gtag);
    })
    .then(() => console.info(`Google Tag Manager: ${googleTagManager}`))
    .catch((error) =>
      console.error(`failed to load Google tag Manager: ${googleTagManager}`, {
        error,
      }),
    );
}

if (adsense) {
  // todo: use import()
  // or @engineers/dom/load()
  let element = document.createElement("script");
  element.setAttribute(
    "src",
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`,
  );
  element.setAttribute("crossorigin", "anonymous");
  element.addEventListener("load", () =>
    console.info(`adsense loaded: ${adsense}`),
  );
  element.addEventListener("error", (error) =>
    console.error(`failed to load adsense: ${adsense}`, error),
  );
  document.head.append(element);
}
