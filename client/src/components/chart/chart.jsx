import React from "react";

const BarChart = ({ data = [], width = 500, height = 300 }) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  if (maxValue === 0) {
    return null; // or some fallback UI
  }

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthIndices = months.map((month) =>
    new Date(`${month} 1 2024`).getMonth()
  );
  //   new Date(`${month} 1 2024`).getMonth()
  // );
  const barWidth = width / 12; // Divide by 12 for the 12 months in a year
  const yAxisTicks = [0, 100, 200, 300, 400, 500]; // Reduce the number of ticks
  const yAxisLabelWidth = 40; // Space for yAxis labels
  const adjustedWidth = width - yAxisLabelWidth; // Adjusted chart width to accommodate y-axis labels
  const adjustedBarWidth = adjustedWidth / 11.7; // Adjusted bar width to have spacing between bars

  return (
    <div className="chart-title">
      <svg width={width} height={height}>
        <g transform={`translate(${yAxisLabelWidth}, 0)`}>
          {yAxisTicks.map((tick, i) => (
            <g key={i}>
              <text
                x={0 - 20} // A bit of space before the yAxis label
                y={height - (tick / maxValue) * height} // Center text vertically
                textAnchor="end"
                fontSize="11"
                fill="black"
              >
                {tick}
              </text>
              <line
                x1={-10}
                y1={tick && (height - (tick / maxValue) * height).toString()}
                x2={adjustedWidth}
                y2={tick && (height - (tick / maxValue) * height).toString()}
                stroke="#f4f4f4"
              />
            </g>
          ))}
        </g>

        {/* Draw bars */}
        <g transform={`translate(${yAxisLabelWidth})`}>
          {data.map((d, i) => (
            <rect
              key={i}
              x={i * adjustedBarWidth + yAxisLabelWidth} // Adjusted x-coordinate
              y={d.value && (height - (d.value / maxValue) * height).toString()} // Invert y-axis for SVG
              width={25} // Adjusted bar width
              height={height && ((d.value / maxValue) * height).toString()}
              fill={d.color}
            />
          ))}
        </g>
        <g transform={`translate(0, ${height + 15})`}>
          {months.map((month, i) => (
            <text
              key={i}
              x={0 - 20} // Adjusted x-coordinate
              y={0}
              textAnchor="middle"
              fontSize="11"
              fill="black"
            >
              {month}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default BarChart;
