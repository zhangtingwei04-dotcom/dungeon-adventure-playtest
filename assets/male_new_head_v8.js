/* Male head V8g: only shorten the lower chin by 1 original pixel.
 * Native 64x160 head stays at identical location with identical upper silhouette.
 * Rows 0..44 untouched (including eyes, eyebrows, nose, raised mouth).
 * Lower-jaw rows 45..50 shifted up one row; no size scaling.
 * Hair, neck, clothing, female head and animation state remain untouched.
 */
window.DUNGEON_MALE_SHARED_FACE_V5="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACgCAMAAACL85puAAAAdVBMVEUAAAAYBg0kDRQnDiIrERgvJCcyFSo9GUNKJyVONktYOTNzU050OXh1XGF8PYOGPoiKV0WRRJKWbmCtVj3DfWfPiWrWv8LXwcPclnXhz9HjnHrl09XooH3ppYTwm+rypPHzu5n16ur249/3wJ37+Pf8zKn80K+Z4dc9AAAAAXRSTlMAQObYZgAAAZNJREFUeNrtld1SgzAQRsmWBsRqaxXF2K1g2bz/I5qE0FLlYkNvnHHPRX8y8x02u2mTZYIg/AfyXAGoanEeamxbIsIGFsUPSCMWkxV5jFtrwzuqNEVucEhHnMHkKQLEaTwYWkzIK/qRDxvhbwKaX3lv4A+jxhmBJdxxN+A6OJN3feSVAHDVwssnZJ4GaHz+rKDh8TYcSeYIo4CmAr+CqJIEl6ePxzFBcD7HMZsiOERBqDsWv0hA4+5TKzAXweQ1QRDGSFXpiAaty7IKY2QLAHJwlCFfxm/cvyYveHhThe6VChXsVa+L9es9Yc07ijnarlPFSn/EDrzrVbHuOuIeZTDUdfqon/rYvH67+rxzAgOcHoAlQ87weJwIjluXd+uWUQPQ4Rm9YbP5Gue3efR5dOssARqkOfw6pwtudqdZgbtkSl4X/W5nCuD/rVY0twdDdcK91g6hl91uH/OntKsJVHP1+AbSL9j8ojCLrmc3j3rYR5ktBZRxPwDIbuG2tCAIgiAIgiAIgiAIgiAIgiAIgiAIf5dv6IxgP96UCq4AAAAASUVORK5CYII=";
window.DUNGEON_MALE_FACE_VERSION="v8-new-eyes";
window.dispatchEvent(new Event('dungeon-male-face-ready'));
