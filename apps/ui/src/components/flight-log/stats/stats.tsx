import { DualAxes } from '@ant-design/charts';
import { LandingData, XPlaneData } from '@zon/xplane-data';
import { Col, Collapse, PageHeader, Row } from 'antd';
import { useObserver } from 'mobx-react-lite';
import ReactMapboxGl, { GeoJSONLayer, Source } from 'react-mapbox-gl';
import React from 'react';
const { Panel } = Collapse;
/* eslint-disable-next-line */
export interface StatsProps {}

export function Stats(props: StatsProps) {
  return useObserver(() => {
    const mylandingData: LandingData = JSON.parse(
      localStorage.getItem('lastFlightLandingData') || '{}'
    );
    let touchDownIndex = 0;
    let index = 0;
    const mydata: any[] = [];
    const mydataTransformed: any[] = [];
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { color: '#F7455D', width: 3 },
          geometry: {
            coordinates: [],
            type: 'LineString',
          },
        },
        {
          type: 'Feature',
          properties: { color: '#e3c412', width: 5 },
          geometry: {
            coordinates: [],
            type: 'LineString',
          },
        },
      ],
    };
    for (const data of mylandingData.data) {
      if (data.ts === mylandingData.touchDown) {
        touchDownIndex = index;
      }
      data.vs = XPlaneData.dataRoundup(data.vs * -1);
      data.agl = XPlaneData.dataRoundup(data.agl * 3.28084);
      data.ts = new Date(data.ts).toISOString();
      if (touchDownIndex === 0) {
        geojson.features[0].geometry.coordinates.push([data.lng, data.lat]);
      } else {
        geojson.features[1].geometry.coordinates.push([data.lng, data.lat]);
      }
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
      if (touchDownIndex !== 0 && index - 100 > touchDownIndex) {
        break;
      }
    }
    const lat = mylandingData.data[touchDownIndex].lat;
    const lng = mylandingData.data[touchDownIndex].lng;
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
      height: 350,
      annotations:
        touchDownIndex !== 0
          ? [
              [
                {
                  type: 'text',
                  position: {
                    ts: mylandingData.data[touchDownIndex].ts,
                    vs: 'max',
                  },
                  content: 'touch down',
                  offsetY: -16,
                },
                {
                  type: 'region',
                  top: true,
                  start: {
                    ts: mylandingData.data[touchDownIndex].ts,
                    vs: 'min',
                  },
                  end: {
                    ts:
                      touchDownIndex + 1 === mylandingData.data.length
                        ? mylandingData.data[touchDownIndex].ts
                        : mylandingData.data[touchDownIndex + 1].ts,
                    vs: 'max',
                  },
                  style: {
                    stroke: '#F4664A',
                    lineWidth: 2,
                    fill: 'red',
                  },
                },
              ],
            ]
          : null,
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 5000,
        },
      },
    };
    const Map = ReactMapboxGl({
      accessToken:
        'pk.eyJ1IjoieGFpcmxpbmUiLCJhIjoiY2t1OGg4YmlkNXZldzJvcG1ud3JwcDc0YiJ9.xLXSPf-vg2YZyjmIykUX-g',
    });
    return (
      <PageHeader
        ghost={false}
        title="Last Landing"
        subTitle={
          <strong>
            G: {XPlaneData.dataRoundup(mylandingData.gForce)} G | VS:
            {Math.round(mylandingData.vs)} fpm
          </strong>
        }
        style={{
          width: '96%',
          marginLeft: '2%',
          height: '100%',
        }}
        backIcon={false}
      >
        <Row>
          <Col span={12}>
            <DualAxes {...config} />
          </Col>
          <Col span={12}>
            <Map
              style="mapbox://styles/mapbox/satellite-v9"
              containerStyle={{
                marginLeft: '16px',
                height: '100%',
                width: '100%',
              }}
              center={[lng, lat]}
              zoom={[14.3]}
              pitch={[53]}
              bearing={[-23]}
            >
              <Source
                id="mapbox-dem"
                type="raster-dem"
                url="mapbox://mapbox.mapbox-terrain-dem-v1"
                tileSize={512}
                maxzoom={14}
              />
              <GeoJSONLayer
                data={geojson}
                // linePaint={{
                //   'line-color': 'red',
                //   'line-width': 1,
                // }}
                lineLayout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
                linePaint={{
                  'line-color': ['get', 'color'],
                  'line-width': ['get', 'width'],
                }}
              />
            </Map>
          </Col>
        </Row>
      </PageHeader>
    );
  });
}

export default Stats;
