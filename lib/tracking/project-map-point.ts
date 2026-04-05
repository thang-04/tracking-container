const LAT_MIN = 8
const LAT_MAX = 23.6
const LNG_MIN = 102
const LNG_MAX = 110
const X_MIN = 55
const X_MAX = 82
const Y_MIN = 8
const Y_MAX = 94

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function projectMapPoint(lat: number, lng: number) {
  const normalizedLat = (clamp(lat, LAT_MIN, LAT_MAX) - LAT_MIN) / (LAT_MAX - LAT_MIN)
  const normalizedLng = (clamp(lng, LNG_MIN, LNG_MAX) - LNG_MIN) / (LNG_MAX - LNG_MIN)

  return {
    x: X_MIN + normalizedLng * (X_MAX - X_MIN),
    y: Y_MAX - normalizedLat * (Y_MAX - Y_MIN),
  }
}
