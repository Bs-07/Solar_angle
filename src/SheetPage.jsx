import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import HyperFormula from 'hyperformula';
import './Sheet.css';

import { Link } from 'react-router-dom';
import { registerAllModules } from 'handsontable/registry';
import * as XLSX from 'xlsx';

// Register all Handsontable modules (including formulas)
registerAllModules();

export default function SheetPage() {
  const location = useLocation();
  const rawSheetData = location.state?.sheetData || [];

  const updateSheetData1 = rawSheetData.map((item, index) => [
    item.date.split('-').reverse().join('-'),
    item.time.slice(0, 5),
    parseFloat(item.altitude.toFixed(2)), // Format altitude
    parseFloat(item.azimuth.toFixed(2)), // Format azimuth
    2, // Placeholder for obstacle height
    `=ROUND(E${index + 2}/TAN(RADIANS(C${index + 2})),2)`,
    `=F${index + 2}*1000`,
    `=-(D${index + 2})`,
  ]);

  const [sheetData1, setSheetData1] = useState([
    [
      'DATE',
      'TIME',
      'ALTITUDE ANGLE (α)',
      'AZIMUTH ANGLE (Ø)',
      'OBSTACLE HEIGHT(MTR)',
      'OBSTACLE SHADOW LENGTH(MTR)',
      'OBSTACLE SHADOW LENGTH(MM)',
      'ANGLE FOR CAD',
    ],
    ...updateSheetData1,
  ]);

  const updateSheetData2 = sheetData1
    .slice(1)
    .map((row, index) => [
      15,
      1.96,
      `=ROUND(B${index + 2}*COS(RADIANS(A${index + 2})),3)`,
      `=ROUND(B${index + 2}*SIN(RADIANS(A${index + 2})),1)`,
      `=D${index + 2}/(TAN(RADIANS(${row[2]})))`,
      `=E${index + 2}*1000`,
      `=E${index + 2}*COS(RADIANS(${row[3]}))`,
      `=ROUND(C${index + 2}+G${index + 2},3)`,
    ]);

  const [sheetData2, setSheetData2] = useState([
    [
      'TILT ANGLE',
      'MODULE LENGTH(MTR)',
      'MODULE WIDTH(MTR)M',
      'HEIGHT(HT)',
      'ROW SPACING-LL',
      'ROW SPACING-MM',
      'TOTAL MIN ROW SPACING',
      'PITCH',
    ],
    ...updateSheetData2,
  ]);

  // Function to handle export

  const exportSheet = () => {
    const ws1 = XLSX.utils.aoa_to_sheet(sheetData1); // Convert Handsontable data to a worksheet
    const ws2 = XLSX.utils.aoa_to_sheet(sheetData2);
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws1, 'Solar Sheet Data 1'); // Add the worksheet
    XLSX.utils.book_append_sheet(wb, ws2, 'Solar Sheet Data 2'); // Add the worksheet
    XLSX.writeFile(wb, 'SolarDataReport.xlsx'); // Export as .xlsx
  };

  return (
    <>
      <div className=" grid justify-center align-middle gap-5 p-8 ">
        <h1 className="main_text text-6xl font-semibold text-green-700 text-center">
          Solar Data Sheet
        </h1>
        <p className="sub_text text-gray-500 pb-8 text-center ">
          {' '}
          Comprehensive Analysis of Sun Angles and Solar Metrics
          <br /> for Precise Calculations
        </p>
      </div>
      <div className="sheet_container">
        <div className="mb-24">
          <div className="title_flex flex align-middle justify-between">
            <p className="sheet_title font-semibold text-3xl py-2 px-6">
              Calculation For Obstacle Shadow
            </p>
            <button
              onClick={exportSheet}
              className="bg-black py-3 px-10 text-2xl mr-8 text-white rounded-2xl"
            >
              Export
            </button>
          </div>
          <div className="sheet">
            <HotTable
              className="custom-table"
              data={sheetData1}
              colHeaders={true}
              rowHeaders={true}
              width="100%"
              height="auto"
              colWidths={[80, 80, 120, 120, 120, 160, 160, 140]}
              autoWrapRow={true}
              autoWrapCol={true}
              dropdownMenu={true}
              contextMenu={true}
              filters={true}
              manualRowResize={true}
              manualColumnResize={true}
              columnSorting={true}
              mergeCells={true}
              formulas={{ engine: HyperFormula }}
              copyPaste={true}
              stretchH="all"
              licenseKey="non-commercial-and-evaluation"
              afterChange={(change, source) => {
                if (source === 'edit') {
                  setSheetData1([...sheetData1]);
                }
              }}
              cells={(row, col) => {
                const cellProperties = {};
                if (col === 0) {
                  // Style the first column (DATE column)
                  cellProperties.className = 'date-column';
                }
                if (row === 0) {
                  // Style the header row
                  cellProperties.className = 'header-row';
                }
                return cellProperties;
              }}
            />
          </div>
        </div>
        <div className="title_flex flex align-middle justify-between">
          <p className="sheet_title font-semibold text-3xl py-2 px-6">
            Calculation For Pitch/Row Spacing
          </p>
          <button
            onClick={exportSheet}
            className="bg-black py-3 px-10 text-2xl mr-8 text-white rounded-2xl"
          >
            Export
          </button>
        </div>
        <div className="sheet">
          <HotTable
            className="custom-table"
            data={sheetData2}
            colHeaders={true}
            rowHeaders={true}
            width="100%"
            height="auto"
            colWidths={[80, 100, 120, 100, 160, 160, 160, 90]}
            autoWrapRow={true}
            autoWrapCol={true}
            dropdownMenu={true}
            contextMenu={true}
            filters={true}
            manualRowResize={true}
            manualColumnResize={true}
            columnSorting={true}
            mergeCells={true}
            formulas={{ engine: HyperFormula }}
            copyPaste={true}
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            afterChange={(change, source) => {
              if (source === 'edit') {
                setSheetData2([...sheetData2]);
              }
            }}
            cells={(row, col) => {
              const cellProperties = {};
              if (col === 0) {
                // Style the first column (DATE column)
                cellProperties.className = 'date-column';
              }
              if (row === 0) {
                // Style the header row
                cellProperties.className = 'header-row';
              }
              return cellProperties;
            }}
          />
        </div>
      </div>
      <Link className="black-link" to="/">
        Go back to Home
      </Link>
    </>
  );
}
