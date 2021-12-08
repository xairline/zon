import { XPlaneData } from '@zon/xplane-data';
import axios from 'axios';
import pako from 'pako';
let dataBuffer = [];
const BATCH_SIZE = 1000;
export let lastTs = 0;
export async function processData(
  data,
  username,
  password,
  recordingID: string
): Promise<string> {
  // Process the data without stalling the UI
  const results = XPlaneData.processRawDataToOpenFDR(data);
  results.forEach((result) => {
    if (result.ts - 1000 > lastTs) {
      dataBuffer.push(result);
      lastTs = result.ts;
    }
  });
  if (dataBuffer.length >= BATCH_SIZE) {
    //todo post batch
    /**
     * 'final' (true or false)
     * 'recordingId' - your generated recordingID (this is for me to regroup the batches later into one recording)
     * 'data' - the gzipped JSON file upload
     */
    const formData = new FormData();
    formData.append('final', 'false');
    formData.append('recordingId', recordingID);
    formData.append(
      'data',
      new Blob([pako.gzip(JSON.stringify(dataBuffer))], {
        type: 'application/gzip',
      })
    );

    dataBuffer = [];
    axios({
      method: 'post',
      url: 'https://zonexecutive.com/action.php/acars/openfdr/recording',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-openFDR-Username': username,
        'X-openFDR-Password': password,
      },
    })
      .then(function (response) {
        //handle success
        console.log(response);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  }

  return;
}

export async function sendFinalBatch(
  username,
  password,
  recordingID: string
): Promise<string> {
  //todo post batch
  /**
   * 'final' (true or false)
   * 'recordingId' - your generated recordingID (this is for me to regroup the batches later into one recording)
   * 'data' - the gzipped JSON file upload
   */
  const formData = new FormData();
  formData.append('final', 'true');
  formData.append('recordingId', recordingID);
  formData.append(
    'data',
    new Blob([pako.gzip(JSON.stringify(dataBuffer))], {
      type: 'application/gzip',
    })
  );

  dataBuffer = [];
  axios({
    method: 'post',
    url: 'https://zonexecutive.com/action.php/acars/openfdr/recording',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-openFDR-Username': username,
      'X-openFDR-Password': password,
    },
  })
    .then(function (response) {
      //handle success
      console.log(response);
    })
    .catch(function (response) {
      //handle error
      console.log(response);
    });

  return;
}
