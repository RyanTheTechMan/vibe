import React, { useMemo } from 'react';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { max, extent, min } from '@visx/vendor/d3-array';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import {AxisBottom, AxisLeft} from "@visx/axis";

export interface LineDataPoint {
    date: string; // ISO date string
    close: number;
}

export interface DetailedStockChartLine {
    id: string; // Unique identifier for the line
    data?: LineDataPoint[];
    strokeColor?: string;
    strokeWidth?: number;
}

interface DetailedStockChartProps {
    lines: DetailedStockChartLine[];
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
}

const DetailedStockChart: React.FC<DetailedStockChartProps> = ({
    lines,
    width,
    height,
    margin = { top: 20, right: 30, bottom: 50, left: 50 },
    }) => {

    const allData = useMemo(() => {
        return lines.flatMap(line => line.data ?? []);
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
    }, [allData, margin.left, innerWidth]);

    const stockValueScale = useMemo(() => {
        const minValue = min(allData, getStockValue) || 0;
        const maxValue = max(allData, getStockValue) || 0;
        return scaleLinear<number>({
            range: [innerHeight + margin.top, margin.top],
            domain: [minValue, maxValue],
            nice: true,
        });
    }, [allData, margin.top, innerHeight]);

    return (
        <Card>
            <CardHeader>
                <p>Detailed Stock Performance</p>
            </CardHeader>
            <CardBody>
                <svg width={width} height={height}>
                    {/* X and Y Axes can be added here if needed */}
                    {lines.map(line => (
                        <LinePath<LineDataPoint>
                            key={line.id}
                            data={line.data}
                            x={d => dateScale(getDate(d)) ?? 0}
                            y={d => stockValueScale(getStockValue(d)) ?? 0}
                            stroke={line.strokeColor || '#000'}
                            strokeWidth={line.strokeWidth || 2}
                            curve={curveMonotoneX}
                        />
                    ))}
                    <AxisBottom
                        top={innerHeight}
                        scale={dateScale}
                        numTicks={5}
                        // @ts-ignore
                        tickFormat={(d) => new Date(d).toLocaleDateString()}
                        stroke="#333"
                        tickStroke="#333"
                        tickLabelProps={() => ({
                            fill: '#333',
                            fontSize: 10,
                            textAnchor: 'middle',
                        })}
                    />
                    <AxisLeft
                        scale={stockValueScale}
                        numTicks={5}
                        tickFormat={(d) => `$${d}`}
                        stroke="#333"
                        tickStroke="#333"
                        tickLabelProps={() => ({
                            fill: '#333',
                            fontSize: 10,
                            textAnchor: 'end',
                            dx: '-0.25em',
                            dy: '0.25em',
                        })}
                    />
                </svg>
            </CardBody>
        </Card>
    );
};

export default DetailedStockChart;