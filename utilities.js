export function resetWidthHeight() {
  let windowInnerWidth = window.innerWidth;
  let windowInnerHeight = window.innerHeight;
  let elementClientWidth = document.documentElement.clientWidth;
  let elementClientHeight = document.documentElement.clientHeight;
  let elementOffsetWidth = document.documentElement.offsetWidth;
  let elementOffsetHeight = document.documentElement.offsetHeight;
  let elementMessage = document.getElementById("message");

  let vh = windowInnerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  let vw = elementClientWidth * 0.01;
  document.documentElement.style.setProperty("--vw", `${vw}px`);

  let screen = {
    width: elementClientWidth,
    height: windowInnerHeight,
    orientation: getScreenOrientation(),
    touchDevice: isTouchDevice(),
    isMobile: isMobileDevice(),
    isDesktop: !isTouchDevice() && !isMobileDevice(),
  };

  return screen;
}

function getScreenOrientation() {
  const orientation =
    screen.orientation || screen.mozOrientation || screen.msOrientation;

  if (orientation && orientation.type) {
    return orientation.type.startsWith("portrait") ? "portrait" : "landscape";
  }

  // Fallback if orientation.type is not available
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
