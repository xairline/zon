import { DualAxes } from '@ant-design/charts';
import { LandingData, XPlaneData } from '@zon/xplane-data';
import { Col, Collapse, PageHeader, Row } from 'antd';
import { useObserver } from 'mobx-react-lite';
import ReactMapboxGl, { GeoJSONLayer, Source } from 'react-mapbox-gl';
import React from 'react';
import { Threebox } from 'threebox-plugin';
const { Panel } = Collapse;
/* eslint-disable-next-line */
export interface StatsProps {}

export function Stats(props: StatsProps) {
  return useObserver(() => {
    try {
      const mylandingData: LandingData = JSON.parse(
        localStorage.getItem('lastFlightLandingData') || '{}'
      );
      mylandingData.data = mylandingData.data.sort((a, b) => a.ts - b.ts);
      const landingLine = [];
      const touchDownLine = [];
      const helpLines = [];
      let touchDownIndex = 0;
      let index = 0;
      const mydata: any[] = [];
      const mydataTransformed: any[] = [];
      let lastLngLat = '';
      let forceLandingLine = false;
      for (const data of mylandingData.data) {
        if (data.ts === mylandingData.touchDown) {
          touchDownIndex = index;
          lastLngLat = '';
        }
        data.vs = XPlaneData.dataRoundup(data.vs * -1);
        data.agl = XPlaneData.dataRoundup(data.agl * 3.28084);
        data.ts = new Date(data.ts).toISOString();

        // draw line
        if (data.gearForce === 0 && !forceLandingLine) {
          if (`${data.lng}-${data.lat}` === lastLngLat) {
            landingLine[landingLine.length - 1] = [
              data.lng,
              data.lat,
              data.agl,
            ];
            helpLines[helpLines.length - 1] = [
              [data.lng, data.lat, 0],
              [data.lng, data.lat, data.agl],
            ];
          } else {
            landingLine.push([data.lng, data.lat, data.agl]);
            helpLines.push([
              [data.lng, data.lat, 0],
              [data.lng, data.lat, data.agl],
            ]);
            lastLngLat = `${data.lng}-${data.lat}`;
          }
        } else {
          forceLandingLine = true;
          touchDownLine.push([data.lng, data.lat, 0]);
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
            height: 500,
            minHeight: 400,
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
                  height: 350,
                  width: '100%',
                }}
                center={[lng, lat]}
                zoom={[15.3]}
                pitch={[53]}
                bearing={[-23]}
                onStyleLoad={(map) => {
                  // add a sky layer that will show when the map is highly pitched
                  map.addLayer({
                    id: 'sky',
                    type: 'sky',
                    paint: {
                      'sky-type': 'atmosphere',
                      'sky-atmosphere-sun': [0.0, 0.0],
                      'sky-atmosphere-sun-intensity': 15,
                    },
                  });
                  map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 22,
                  });
                  // add the DEM source as a terrain layer with exaggerated height
                  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                  map.addLayer({
                    id: 'custom_layer',
                    type: 'custom',
                    renderingMode: '3d',
                    onAdd: function (map, mbxContext) {
                      // instantiate threebox
                      window.tb = new Threebox(map, mbxContext, {
                        realSunlight: true,
                        sky: true,
                        terrain: true,
                        enableSelectingObjects: true,
                        enableTooltips: true,
                      });

                      const lineOptions = {
                        geometry: landingLine,
                        color: '#DF1212',
                        width: 8,
                      };

                      const lineMesh = window.tb.line(lineOptions);

                      window.tb.add(lineMesh);

                      for (const helpLine of helpLines) {
                        const lineOptions = {
                          geometry: helpLine,
                          color: '#DF1212',
                          width: 4,
                        };

                        const lineMesh = window.tb.line(lineOptions);

                        window.tb.add(lineMesh);
                      }

                      // const tooltip = window.tb
                      //   .tooltip({
                      //     text: 'touch down',
                      //   })
                      //   .setCoords(helpLines[helpLines.length - 1][1]);
                      // window.tb.add(tooltip);

                      const lineOptions2 = {
                        geometry: touchDownLine,
                        color: '#12c1f2',
                        width: 8,
                      };

                      const lineMesh2 = window.tb.line(lineOptions2);

                      window.tb.add(lineMesh2);
                    },

                    render: function (gl, matrix) {
                      window.tb.update();
                    },
                  });
                }}
              ></Map>
            </Col>
          </Row>
        </PageHeader>
      );
    } catch (e) {
      return <></>;
    }
  });
}

export default Stats;
