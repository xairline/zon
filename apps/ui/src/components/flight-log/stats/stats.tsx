import { DualAxes } from '@ant-design/charts';
import { LandingData, XPlaneData } from '@zon/xplane-data';
import { Col, Collapse, PageHeader, Row, Statistic } from 'antd';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
const { Panel } = Collapse;
/* eslint-disable-next-line */
export interface StatsProps {}

export function Stats(props: StatsProps) {
  return useObserver(() => {
    const mylandingData: LandingData = JSON.parse(
      localStorage.getItem('lastFlightLanding') || '{}'
    );
    let touchDownTs = 0;
    let index = 0;
    let touchDownCounter = -1;
    const mydata: any[] = [];
    const mydataTransformed: any[] = [];
    mylandingData.data.forEach((data: any) => {
      if (touchDownCounter === 0) {
        return;
      } else {
        touchDownCounter--;
      }
      if (
        Math.round(data.vs * 196.85 * 100) ===
        Math.round(mylandingData.vs * 100)
      ) {
        touchDownTs = index;
        touchDownCounter = 100;
      }
      data.vs = XPlaneData.dataRoundup(data.vs * 196.85 * -1);
      data.agl = XPlaneData.dataRoundup(data.agl * 3.28084);
      data.ts = new Date(data.ts).toISOString();
      if (data.agl < 50) {
        mydata.push(data);
        mydataTransformed.push({
          ts: data.ts,
          name: 'agl',
          value: data.agl,
        });
        mydataTransformed.push({
          ts: data.ts,
          name: 'pitch',
          value: XPlaneData.dataRoundup(data.pitch),
        });
        mydataTransformed.push({
          ts: data.ts,
          name: 'ias',
          value: XPlaneData.dataRoundup(data.ias),
        });
      }
      index++;
    });
    const config = {
      data: [mydata, mydataTransformed],
      xField: 'ts',
      yField: ['vs', 'value'],
      geometryOptions: [
        {
          geometry: 'line',
        },
        {
          geometry: 'line',
          seriesField: 'name',
        },
      ],
      height: 250,
      annotations: [
        [
          {
            type: 'text',
            position: { ts: mylandingData.data[touchDownTs].ts, vs: 'max' },
            content: 'touch down',
            offsetY: -16,
          },
          {
            type: 'region',
            top: true,
            start: { ts: mylandingData.data[touchDownTs].ts, vs: 'min' },
            end: { ts: mylandingData.data[touchDownTs + 1].ts, vs: 'max' },
            style: {
              stroke: '#F4664A',
              lineWidth: 2,
              fill: 'red',
            },
          },
        ],
      ],
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 5000,
        },
      },
    };
    return (
      <PageHeader
        ghost={false}
        title="Last Landing"
        subTitle={
          <strong>
            G: {XPlaneData.dataRoundup(mylandingData.gForce)} G | VS:
            {mylandingData.vs} fpm
          </strong>
        }
        style={{
          width: '96%',
          marginLeft: '2%',
        }}
        backIcon={false}
      >
        <DualAxes {...config} />
      </PageHeader>
    );
  });
}

export default Stats;
