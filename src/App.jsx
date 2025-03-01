import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import './style.css';
import './btn.css';
import { Calculate_Sunangle } from './Calculate_Sunangle';
import { Calculate_SunangleRange } from './Calculate_SunangleRange';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// import { basic } from './basic.jsx';

function App() {
  const [date, setDate] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [elevation, setElevation] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [longitudeDirection, setLongitudeDirection] = useState('E');
  const [latitudeDirection, setLatitudeDirection] = useState('N');
  const [elevationUnit, setElevationUnit] = useState('meters');
  const [timeFormat, setTimeFormat] = useState('am');
  const [customAzimuth, setCustomAzimuth] = useState('north');

  const [result, setResult] = useState({ specific: null, range: [] });
  const [hasCalculated, setHasCalculated] = useState(false);

  const resultRef = useRef(null);

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    setDate(
      `${year}-${month < 10 ? '0' + month : month}-${
        day < 10 ? '0' + day : day
      }`
    );
  }, []);

  useEffect(() => {
    if (
      result.specific ||
      (result.specific && result.range.length > 0 && hasCalculated)
    ) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const handleCalculation = (e) => {
    e.preventDefault();

    const lon = parseFloat(longitude) * (longitudeDirection === 'W' ? -1 : 1);
    const lat = parseFloat(latitude) * (latitudeDirection === 'S' ? -1 : 1);
    const elev = parseFloat(elevation);
    const cusAz = customAzimuth;
    const latDir = latitudeDirection;

    //   handle date and time together
    let datetimeString = `${date}T${time}`;
    console.log('Datetime_App:', datetimeString);

    if (timeFormat === 'am' || timeFormat === 'pm') {
      const [hours, minutes] = time
        .split(':')
        .map((item) => parseInt(item, 10));
      const isPM = timeFormat === 'pm';
      const adjustedHours = isPM ? (hours % 12) + 12 : hours % 12; // 12 -> 12, 1 -> 13, 2 -> 14, ..., 11 -> 23
      const timeString = `${adjustedHours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;

      datetimeString = `${date}T${timeString}`;
    }

    const calculateDate = moment.tz(datetimeString, timezone).toDate();

    console.log('Calculation Date:', calculateDate.toISOString());
    console.log(
      ('lon:', lon, 'lat:', lat, 'date:', calculateDate, 'elev:', elev)
    );

    if (
      isNaN(lon) ||
      isNaN(lat) ||
      isNaN(calculateDate.getTime()) ||
      isNaN(elev)
    ) {
      console.log('Please enter valid longitude, latitude, date and elevation');
    }

    if (
      lon < -180 ||
      lon > 180 ||
      lat < -90 ||
      lat > 90 ||
      elev < 0 ||
      elev > 10000
    ) {
      console.log('Please enter valid longitude and latitude');
    }

    const solarangle = Calculate_Sunangle(
      calculateDate,
      lon,
      lat,
      elev,
      cusAz,
      latDir,
      timezone
    );

    const rangeData = Calculate_SunangleRange(
      date,
      lon,
      lat,
      elev,
      cusAz,
      latDir,
      timezone
    );
    console.log(
      'Altitude:',
      solarangle.altitude,
      'Azimuth:',
      solarangle.azimuth,
      'sheetData:',
      rangeData
    );
    setResult({ specific: solarangle, range: rangeData });
    setHasCalculated(true);
  };

  const timezones = moment.tz.names();

  const navigation = useNavigate();
  const handleNavigation = () => {
    navigation('/sheet', { state: { sheetData: result?.range || [] } });
  };

  return (
    <>
      <div class="container--header">
        <h1 className="logo">Surya Korn</h1>
        <p class="subtitle">Tool calculates solar angle data</p>
        {/* Progress Steps  */}
        {/* <div class="progress-steps">
          <div class="step active">
            <div class="step-number">1</div>
            <div class="step-text">Input Parameters</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">Calculate</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">View Results</div>
          </div>
        </div> */}

        <form onSubmit={handleCalculation}>
          <div class="form-row">
            {/* Left Column  */}
            <div class="form-column">
              <div class="form-group">
                <label for="longitude">Longitude</label>
                <div class="input-group">
                  <input
                    type="number"
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    step="0.000001"
                    placeholder="Enter longitude"
                  />
                  <select
                    id="longitude-direction"
                    value={longitudeDirection}
                    onChange={(e) => setLongitudeDirection(e.target.value)}
                  >
                    <option value="E">East</option>
                    <option value="W">West</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="latitude">Latitude</label>
                <div class="input-group">
                  <input
                    type="number"
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    step="0.000001"
                    placeholder="Enter latitude"
                  />
                  <select
                    id="latitude-direction"
                    value={latitudeDirection}
                    onChange={(e) => setLatitudeDirection(e.target.value)}
                  >
                    <option value="N">North</option>
                    <option value="S">South</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div class="form-group">
                <label for="elevation">Elevation</label>
                <div class="input-group">
                  <input
                    type="number"
                    id="elevation"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    placeholder="Enter elevation"
                  />
                  <select
                    id="elevation-unit"
                    value={elevationUnit}
                    onChange={(e) => setElevationUnit(e.target.value)}
                  >
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column  */}
            <div class="form-column">
              <div class="form-group">
                <label for="time">Time</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="hrs:min"
                  />
                  <select
                    id="time-format"
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                    <option value="24">24Hr</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="timezone">Time Zone</label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {timezones.map((timezone) => (
                    <option value={timezone}>{timezone}</option>
                  ))}
                </select>
              </div>
              <div class="form-group">
                <label for="date">Zero Azimuth</label>
                <select
                  id="zero-azimuth"
                  value={customAzimuth}
                  onChange={(e) => {
                    setCustomAzimuth(e.target.value);
                  }}
                >
                  <option value="north">North</option>
                  <option value="east">East </option>
                  <option value="south">South </option>
                  <option value="west">West </option>
                </select>
              </div>
            </div>
          </div>

          <div class="button-container">
            <button class="shiny-cta" type="submit">
              Calculate
            </button>
          </div>
        </form>
        {/* <DotLottieReact
          src="https://lottie.host/3247a017-f728-40f2-ac89-cc23abd11855/hGyKuwR0xe.lottie"
          loop
          autoplay
        /> */}
      </div>
      {result.specific && (
        // <div
        //   className={`result-container ${result ? 'show' : ''}`}
        //   ref={resultRef}
        // >
        //   <div className="sub-result r-1">
        //     <div className="content-row">
        //       <div className="info-card">
        //         <p>Altitude angle</p>
        //         <span className="value">{result.altitude}°</span>
        //       </div>
        //       <div className="info-card">
        //         <p>Azimuth angle</p>
        //         <span className="value">{result.azimuth}°</span>
        //       </div>
        //     </div>
        // <div className="info-section"> Solar Angle</div>
        //   </div>
        //   <div className="sub-result r-2">
        // <div className="info-card more-info">
        //   <div>
        //     <p>Equation of Time</p>
        //     <span className="value">{result.eot}</span>
        //   </div>
        //   <div>
        //     <p>Declination</p>
        //     <span className="value">{result.declination}</span>
        //   </div>
        //   <div>
        //     <p>Hour Angle</p>
        //     <span className="value">{result.hourAngle}</span>
        //   </div>
        // </div>
        //     <div className="content-row">
        //   <div className="info-card sunrise">
        //     <div className="sub_card">
        //       <p>Sunrise</p>
        //       <ion-icon name="sunny"></ion-icon>
        //     </div>
        //     <span className="value">{result.sunrise}</span>
        //   </div>
        //   <div className="info-card sunset">
        //     <div className="sub_card">
        //       <p>Sunset</p>
        //       <ion-icon name="moon"></ion-icon>
        //     </div>
        //     <span className="value">{result.sunset}</span>
        //   </div>
        //     </div>
        //   </div>
        // </div>

        <div className="R_container">
          <div
            className={`result-container ${result.specific ? 'show' : ''}`}
            ref={resultRef}
          >
            <div className="sub-result-container ">
              <div className="info-card">
                <p>Altitude angle</p>
                <span className="value">{result.specific.altitude}°</span>
              </div>
            </div>
            <div className="sub-result-container ">
              <div className="info-card">
                <p>Azimuth angle</p>
                <span className="value">{result.specific.azimuth}°</span>
              </div>
            </div>
            <div className="sub-result-container big-1">
              <div className="more-info">
                <div className="m_info">
                  <p>Hour Angle</p>
                  <span className="value">{result.specific.hourAngle} </span>
                </div>
                <div className="m_info">
                  <p>Declination</p>
                  <span className="value">{result.specific.declination}</span>
                </div>
                <div className="m_info">
                  <p>Equation of Time</p>
                  <span className="value">{result.specific.eot}</span>
                </div>
              </div>
            </div>
            <div className="sub-result-container big-2">
              <div className="info-section"> Solar Angle</div>
            </div>
            <div className="sub-result-container big-3">
              <div className="info-card">
                <div className="sub_card">
                  <p className="sp">Daylight Duration</p>
                </div>
                <span className="value">
                  {result.specific.totalSunlightHours}
                </span>
              </div>
            </div>
            <div className="sub-result-container">
              <div className="info-card">
                <button onClick={handleNavigation}>
                  <div className="sub_card">
                    <p className="link">
                      Open Excel
                      <br /> Sheet
                    </p>
                  </div>
                </button>
              </div>
            </div>
            <div className="sub-result-container ">
              <div className="info-card sunrise">
                <div className="sub_card">
                  <p>Sunrise</p>
                  <ion-icon name="sunny-outline"></ion-icon>
                </div>
                <span className="value">{result.specific.sunrise}</span>
              </div>
            </div>
            <div className="sub-result-container ">
              <div className="info-card noon">
                <div className="sub_card">
                  <p>Solar Noon</p>
                  <ion-icon name="sunny"></ion-icon>
                </div>
                <span className="value">{result.specific.solarNoon}</span>
              </div>
            </div>
            <div className="sub-result-container ">
              <div className="info-card sunset">
                <div className="sub_card">
                  <p>Sunset</p>
                  <ion-icon name="moon-outline"></ion-icon>
                </div>
                <span className="value">{result.specific.sunset}</span>
              </div>
            </div>
            <div className="sub-result-container ">
              <div className="info-card dusk">
                <div className="sub_card">
                  <p>Dusk</p>
                  <ion-icon name="moon"></ion-icon>
                </div>
                <span className="value">{result.specific.dusk}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
