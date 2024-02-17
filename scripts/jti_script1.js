import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import papaparse from 'https://cdn.jsdelivr.net/npm/papaparse@5.3.0';

const data = papaparse.parse(open('.././credentials.csv'), { header: true }).data.slice(0, 2); // Take only the first two rows
const responseTimeTrend = new Trend('response_time');

export default function () {
    for (let i = 0; i < data.length; i++) {
        const payload = {
            ba_code: data[i].ba_code,
            password: data[i].password,
        };

        const headers = {
            'Content-Type': 'application/json',
        };

        const response = http.post('https://dev-jti.sslwireless.com/api/v1/login', JSON.stringify(payload), { headers });

        console.log(`Request for user ${data[i].ba_code}: ${JSON.stringify(payload)}`);
        console.log(`Response status: ${response.status}`);
        console.log(`Response body: ${response.body}`);

        check(response, {
            'is status 200': (r) => r.status === 200,
        });

        if (response.status === 500) {
            console.error('Server Error:', response.body);
            console.log(`Request for user ${data[i].ba_code}: ${JSON.stringify(payload)}`);
        }

        if (response.status === 422) {
            console.log(`Response Status: ${response.status}`);
            console.log(`Request for user ${data[i].ba_code}: ${JSON.stringify(payload)}`);
            // Remove this line if not intended to log the password again
            console.log(`Request for password : ${JSON.stringify(payload)}`);
        }

        // Track response time
        responseTimeTrend.add(response.timings.duration);

        // Sleep between iterations if needed
        sleep(1);
    }
}
