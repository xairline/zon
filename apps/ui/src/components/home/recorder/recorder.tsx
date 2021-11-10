import styled from '@emotion/styled';
import { Badge, PageHeader, Row } from 'antd';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useGlobalStores } from '../../../stores';

/* eslint-disable-next-line */
export interface RecorderProps {}

const StyledRecorder = styled.div`
  color: pink;
`;

export function Recorder(props: RecorderProps) {
  const { DatarefStore } = useGlobalStores();
  return useObserver(() => (
    <StyledRecorder>
      <Row>
        <PageHeader
          ghost={false}
          backIcon={false}
          title="Recorder Status"
          subTitle={
            <>
              {DatarefStore.isXPlaneConnected ? (
                <Badge status="success" />
              ) : (
                <Badge status="error" />
              )}{' '}
              X Plane
            </>
          }
          style={{
            width: '96%',
            marginLeft: '2%',
          }}
        >
          {DatarefStore.isXPlaneConnected
            ? JSON.stringify(DatarefStore.flightData)
            : ''}
        </PageHeader>
      </Row>
    </StyledRecorder>
  ));
}

export default Recorder;
