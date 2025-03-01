import Suncalc from 'suncalc';
import moment from 'moment-timezone';
import { calculateRefraction } from './CalculateRefraction';

export function Calculate_SunangleRange(
  date,
  lon,
  lat,
  observerElevation = 0,
  customAzimuth,
  latDir,
  timezone
) {
  const times = Array.from(
    { length: 8 },
    (_, i) => `${String(i + 9).padStart(2, '0')}:00:00`
  );

  const calculatedData = [];

  const calculatedRange = times.map((time) => {
    // handling the date and time
    const datetimeString = `${moment(date).format('YYYY-MM-DD')}T${time}`;
    const calculateDate = moment.tz(datetimeString, timezone).toDate();

    const sunPosition = Suncalc.getPosition(calculateDate, lat, lon);

    let altitude = sunPosition.altitude * (180 / Math.PI); // in degrees
    const rawAzimuth = sunPosition.azimuth * (180 / Math.PI); // in degrees

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

    calculatedData.push({
      date,
      time,
      altitude,
      azimuth: adjustedAzimuth,
    });
  });

  return calculatedData;
}
