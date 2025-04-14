import React from 'react';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  hideAxis?: boolean;
}

/**
 * Simple line chart component for sparklines
 */
const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 100,
  height = 50,
  color = '#22c55e',
  hideAxis = false
}) => {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="rounded">
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="10">
          No data
        </text>
      </svg>
    );
  }

  // Calculate min and max values for scaling
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Calculate points for the line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="rounded">
      {/* Draw the actual line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Optional fill for the area under the line */}
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`${color}20`} // Add transparency to the fill color
        stroke="none"
      />
      
      {!hideAxis && (
        <>
          {/* X-axis */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="#e5e7eb" strokeWidth="0.5" />
          
          {/* Y-axis */}
          <line x1="0" y1="0" x2="0" y2={height} stroke="#e5e7eb" strokeWidth="0.5" />
        </>
      )}
    </svg>
  );
};

export default LineChart;