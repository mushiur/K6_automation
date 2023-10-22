import http from 'k6/http';
import { check, group } from 'k6';
import papaparse from 'https://cdn.jsdelivr.net/npm/papaparse@5.3.0/papaparse.min.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function handleSummary(data) {
    return {
      "summary.html": htmlReport(data),
    };
}



export let options = {
  vus: 10,
  duration: '30s',
};

// Read data from a CSV file
let csvData = papaparse.parse(open('./testdata.csv'), { header: true }).data;

// Define an array of live API endpoints to test
const apiEndpoints = [
  'https://jsonplaceholder.typicode.com/posts',
  'https://reqres.in/api/users',
];

export default function () {
  for (let i = 0; i < apiEndpoints.length; i++) {
    let endpoint = apiEndpoints[i];

    // Use the "group" function to organize checks for each endpoint
    group(`API Endpoint ${i + 1}`, function () {
      for (let j = 0; j < csvData.length; j++) {
        let row = csvData[j];

        let response = http.get(endpoint, {
          params: row,
        });

        check(response, {
          'is status 200': (r) => r.status === 200,
          'is content type JSON': (r) => r.headers['Content-Type'] === 'application/json; charset=utf-8',
        });

        // Additional assertions specific to the endpoint
        if (i === 0) {
          // For the first endpoint (JSONPlaceholder)
          check(response, {
            'has 100 items': (r) => JSON.parse(r.body).length === 100,
          });
        } else if (i === 1) {
          // For the second endpoint (ReqRes)
          check(response, {
            'has 6 users': (r) => JSON.parse(r.body).data.length === 6,
          });
        }
      }
    });
  }
}
