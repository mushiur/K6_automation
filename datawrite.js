import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import papaparse from 'file:///F:/k6-test_script/PapaParse-5.0.2/papaparse.min.js';
import { open } from 'k6';

let requestLog = new Trend('requestLog');
let responseLog = new Trend('responseLog');

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export function handleRequest(requestData) {
  requestLog.add(1, { data: requestData });
}

export function handleResponse(responseData) {
  responseLog.add(1, { data: responseData });
}

export default function () {
  const url = 'https://cineplex-ticket-api.cineplexbd.com/api/v1/login';
  const payload = JSON.stringify({
    email: '01938286036',
    password: '12345678',
    token: '54354rtfd54543543ff',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(url, payload, params);

  handleRequest(payload);
  handleResponse(response.body);

  // Export data to CSV
  let csvData = [];

  if (requestLog.dataset && responseLog.dataset) {
    const requestDataSet = requestLog.dataset;
    const responseDataSet = responseLog.dataset;
    csvData = requestDataSet.concat(responseDataSet);
  }

  if (csvData.length > 0) {
    const csv = papaparse.unparse(csvData);

    // Save the CSV data to the local working directory
    open("Testdata.csv", "w").write(csv);
  }

  console.log('Request:', payload);
  console.log('Response:', response.body);
}