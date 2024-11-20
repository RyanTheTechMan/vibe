import React, { useMemo } from 'react';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { max, extent, min } from '@visx/vendor/d3-array';

interface LineDataPoint {
    date: string; // ISO date string
    close: number;
}

interface MiniStockChartLine {
    id: string; // Unique identifier for the line
    data: LineDataPoint[];
    curve?: (context: any) => any;
    strokeColor?: string;
    strokeWidth?: number;
}

interface MiniStockChartProps {
    lines: MiniStockChartLine[];
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
}

const MiniStockChart: React.FC<MiniStockChartProps> = ({
    lines,
    width,
    height,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
}) => {

    const allData = useMemo(() => {
        return lines.flatMap(line => line.data);
    }, [lines]);

    const getDate = (d: LineDataPoint) => new Date(d.date);
    const getStockValue = (d: LineDataPoint) => d.close;

    // Bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const dateScale = useMemo(() => {
        const [minDate, maxDate] = extent(allData, getDate) as [Date, Date];
        return scaleTime<number>({
            range: [margin.left, innerWidth + margin.left],
            domain: [minDate, maxDate],
            nice: true,
        });
    }, [allData, margin.left]);

    const stockValueScale = useMemo(() => {
        const minValue = min(allData, getStockValue) || 0;
        const maxValue = max(allData, getStockValue) || 0;
        return scaleLinear<number>({
            range: [innerHeight + margin.top, margin.top],
            domain: [minValue, maxValue],
            nice: true,
        });
    }, [allData, margin.top]);

    return (
        <svg width={width} height={height}>
            {lines.map(line => (
                <LinePath<LineDataPoint>
                    key={line.id}
                    data={line.data}
                    x={d => dateScale(getDate(d)) ?? 0}
                    y={d => stockValueScale(getStockValue(d)) ?? 0}
                    stroke={line.strokeColor || '#fff'}
                    strokeWidth={line.strokeWidth || 2}
                    curve={line.curve || curveMonotoneX}
                />
            ))}
        </svg>
    );
};

export default MiniStockChart;
