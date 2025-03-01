export const calculateRefraction = (altitude, observerElevation) => {
  if (altitude > 85) return 0;

  const refraction =
    (1.02 / Math.tan(altitude + 10.3 / (altitude + 5.11))) * (Math.PI / 180); // in degrees

  const altitudeAdjustment =
    Math.atan(observerElevation / 6371000) * (180 / Math.PI); // in degrees
  const altitudeRefraction = refraction - altitudeAdjustment * 0.02;

  return refraction + altitudeRefraction;
};
