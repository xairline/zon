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
      localStorage.getItem('lastFlightLanding')
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
      data.vs = Math.round(data.vs * 196.85 * 100) / 100;
      data.agl = Math.round(data.agl * 3.28084 * 100) / 100;
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
      // <Collapse
      //   expandIconPosition="right"
      //   accordion={false}
      //   style={{
      //     maxHeight: '95%',
      //     width: '96%',
      //     marginLeft: '2%',
      //   }}
      // >
      //   <Panel
      //     header={
      //       <Row>
      //         <Col span={12}>
      //           <Statistic
      //             title="Langding G Force"
      //             value={mylandingData.gForce}
      //             precision={2}
      //             valueStyle={
      //               mylandingData.gForce < 1.5
      //                 ? { color: '#3f8600' }
      //                 : mylandingData.gForce < 2.5
      //                 ? { color: '#d4b106' }
      //                 : { color: '#cf1322' }
      //             }
      //             suffix="G"
      //           />
      //         </Col>
      //         <Col span={12}>
      //           <Statistic
      //             title="Langding VS"
      //             value={mylandingData.vs || '--'}
      //             precision={2}
      //             valueStyle={
      //               mylandingData.vs * -1 < 100
      //                 ? { color: '#3f8600' }
      //                 : mylandingData.vs * -1 < 250
      //                 ? { color: '#d4b106' }
      //                 : { color: '#cf1322' }
      //             }
      //             suffix="ft/min"
      //           />
      //         </Col>
      //       </Row>
      //     }
      //     key="0"
      //   >

      //   </Panel>
      // </Collapse>
    );
  });
}

export default Stats;
