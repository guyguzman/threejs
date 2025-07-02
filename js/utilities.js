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

export function hideAllChildren(parentElement) {
  if (!parentElement) {
    console.warn("hideAllChildren: No parent element provided");
    return;
  }

  const children = parentElement.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName.toLowerCase() === "div") {
      children[i].style.display = "none";
    }
  }
}

export async function readPrayerFile(filename) {
  try {
    const response = await fetch(`/prayers/${filename}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch prayer file: ${response.status} ${response.statusText}`
      );
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error reading prayer file ${filename}:`, error);
    throw error;
  }
}

export async function readJsonFile(filepath) {
  try {
    const response = await fetch(filepath);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch JSON file: ${response.status} ${response.statusText}`
      );
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error(`Error reading JSON file ${filepath}:`, error);
    throw error;
  }
}

export async function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();

  oscillator.type = "sine"; // Waveform type
  oscillator.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz (A4 note)
  oscillator.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.1); // 100ms duration
}

export async function sleepMilliseconds(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
