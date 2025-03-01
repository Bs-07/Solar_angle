import Suncalc from 'suncalc';
import moment from 'moment';
import { calculateRefraction } from './CalculateRefraction';

export function Calculate_Sunangle(
  date,
  lon,
  lat,
  observerElevation = 0,
  customAzimuth,
  latDir,
  timezone
) {
  const sunPosition = Suncalc.getPosition(date, lat, lon);

  let altitude = sunPosition.altitude * (180 / Math.PI); // in degrees
  const rawAzimuth = sunPosition.azimuth * (180 / Math.PI); // in degrees
  //   const normalizedAzimuth = (rawAzimuth + 360) % 360; // normalize to 0-360 degrees
  //   const adjustedAzimuth = (normalizedAzimuth - customAzimuth + 360) % 360;

  let zeroAzimuth = 0;

  if (customAzimuth === 'north') zeroAzimuth = latDir === 'N' ? 180 : 0; // 180 for N, 0 for S
  if (customAzimuth === 'east') zeroAzimuth = 90;
  if (customAzimuth === 'south') zeroAzimuth = latDir === 'N' ? 0 : 180; // 0 for N, 180 for S
  if (customAzimuth === 'west') zeroAzimuth = 270;

  const adjustedAzimuth =
    zeroAzimuth === 0 ? rawAzimuth : (rawAzimuth - zeroAzimuth + 360) % 360;

  console.log(
    'Raw Azimuth:',
    rawAzimuth,
    'Zero Azimuth:',
    zeroAzimuth,
    'Adjusted Azimuth:',
    adjustedAzimuth
  );

  const refraction = calculateRefraction(altitude, observerElevation); // in degrees
  altitude += refraction;

  //   sunrise and sunset
  const times = Suncalc.getTimes(date, lat, lon);

  const totalSunlightHours = (times.sunset - times.sunrise) / (1000 * 60 * 60); // Convert ms to hours
  // Format duration (e.g., hours and minutes)
  const hours = Math.floor(totalSunlightHours);
  const minutes = Math.round((totalSunlightHours - hours) * 60);

  // Combine hours and minutes into a formatted string
  const formattedDuration = `${hours}h ${minutes}m`;

  const formatTime = (utcDate) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(utcDate);

  const sunrise = formatTime(times.sunrise);
  const sunset = formatTime(times.sunset);
  const solarNoon = formatTime(times.solarNoon);
  const dusk = formatTime(times.dusk);

  console.log(
    'Sunrise:',
    sunrise,
    'Sunset:',
    sunset,
    'Solar Noon:',
    solarNoon,
    'Total Sunlight Hours:',
    formattedDuration
  );

  // Day of year
  const getDayOfYear = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  };

  const n = getDayOfYear(date); // Day of year

  // Declination
  const declination =
    23.45 * Math.sin((360 / 365) * (n - 81) * (Math.PI / 180));
  const declRad = declination * (Math.PI / 180);

  // Equation of Time
  const B = (360 * (n - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Hour Angle
  const latRad = lat * (Math.PI / 180);
  const hourAngle = Math.acos(
    (Math.sin(-0.83 * (Math.PI / 180)) - Math.sin(latRad) * Math.sin(declRad)) /
      (Math.cos(latRad) * Math.cos(declRad))
  );

  console.log(
    'day of year:',
    n,
    'declination:',
    declination,
    'b:',
    B,
    'eot:',
    eot,
    'hour angle:',
    hourAngle
  );

  return {
    altitude: altitude.toFixed(2),
    azimuth: adjustedAzimuth.toFixed(2),
    sunrise: sunrise,
    sunset: sunset,
    solarNoon: solarNoon,
    dusk: dusk,
    totalSunlightHours: formattedDuration,
    declination: declination.toFixed(2),
    hourAngle: hourAngle.toFixed(2),
    eot: eot.toFixed(2),
  };
}
