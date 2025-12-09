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
  //   const [date, setDate] = useState('');
  //   const [longitude, setLongitude] = useState('');
  //   const [latitude, setLatitude] = useState('');
  //   const [elevation, setElevation] = useState('');
  //   const [time, setTime] = useState('');
  //   const [timezone, setTimezone] = useState('Asia/Kolkata');
  //   const [longitudeDirection, setLongitudeDirection] = useState('E');
  //   const [latitudeDirection, setLatitudeDirection] = useState('N');
  //   const [elevationUnit, setElevationUnit] = useState('meters');
  //   const [timeFormat, setTimeFormat] = useState('am');
  //   const [customAzimuth, setCustomAzimuth] = useState('north');
  const today = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  console.log(today());

  const [formValue, setFormValue] = useState(() => {
    const saved = localStorage.getItem('solarForm-data');
    return saved
      ? JSON.parse(saved)
      : {
          longitude: '',
          longitudeDirection: 'E',
          latitude: '',
          latitudeDirection: 'N',
          date: today(),
          elevation: '',
          elevationUnit: 'meters',
          time: '',
          timeFormat: 'am',
          timezone: 'Asia/Kolkata',
          customAzimuth: 'north',
        };
  });

  const [result, setResult] = useState({ specific: null, range: [] });
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };
  console.log(formValue);

  //   const handleFormSubmit = (e) => {
  //     e.preventDefault();
  //   };

  const resultRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('solarForm-data', JSON.stringify(formValue));
  }, [formValue]);

  useEffect(() => {
    if (result?.specific && result?.range?.length > 0) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const handleCalculation = (e) => {
    e.preventDefault();

    const {
      longitude,
      longitudeDirection,
      latitude,
      latitudeDirection,
      date,
      elevation,
      customAzimuth,
      time,
      timeFormat,
      timezone,
    } = formValue;

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
    } else if (timeFormat === '24') {
      datetimeString = `${date}T${time}`;
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
      <div className="container--header">
        <h1 className="logo">Surya Korn</h1>
        <p className="subtitle">Tool calculates solar angle data</p>

        <form onSubmit={handleCalculation}>
          <div className="form-row">
            {/* Left Column  */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <div className="input-group">
                  <input
                    name="longitude"
                    type="number"
                    id="longitude"
                    value={formValue.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    placeholder="Enter longitude"
                  />
                  <select
                    name="longitudeDirection"
                    id="longitude-direction"
                    value={formValue.longitudeDirection}
                    onChange={handleChange}
                  >
                    <option value="E">East</option>
                    <option value="W">West</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <div className="input-group">
                  <input
                    name="latitude"
                    type="number"
                    id="latitude"
                    value={formValue.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    placeholder="Enter latitude"
                  />
                  <select
                    name="latitudeDirection"
                    id="latitude-direction"
                    value={formValue.latitudeDirection}
                    onChange={handleChange}
                  >
                    <option value="N">North</option>
                    <option value="S">South</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  name="date"
                  type="date"
                  id="date"
                  value={formValue.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="elevation">Elevation</label>
                <div className="input-group">
                  <input
                    name="elevation"
                    type="number"
                    id="elevation"
                    value={formValue.elevation}
                    onChange={handleChange}
                    placeholder="Enter elevation"
                  />
                  <select
                    name="elevationUnit"
                    id="elevation-unit"
                    value={formValue.elevationUnit}
                    onChange={handleChange}
                  >
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column  */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <div className="input-group">
                  <input
                    name="time"
                    type="time"
                    id="time"
                    value={formValue.time}
                    onChange={handleChange}
                    placeholder="hrs:min"
                  />
                  <select
                    name="timeFormat"
                    id="time-format"
                    value={formValue.timeFormat}
                    onChange={handleChange}
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                    <option value="24">24Hr</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Time Zone</label>
                <select
                  name="timezone"
                  id="timezone"
                  value={formValue.timezone}
                  onChange={handleChange}
                >
                  {timezones.map((timezone, index) => (
                    <option key={index} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Zero Azimuth</label>
                <select
                  name="customAzimuth"
                  id="zero-azimuth"
                  value={formValue.customAzimuth}
                  onChange={handleChange}
                >
                  <option value="north">North</option>
                  <option value="east">East </option>
                  <option value="south">South </option>
                  <option value="west">West </option>
                </select>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button className="shiny-cta" type="submit">
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
