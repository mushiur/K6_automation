import http from 'k6/http';
import { check, sleep } from 'k6';
import { text2csv } from 'https://jslib.k6.io/k6-strings/0.0.1/index.js';

let csvData = text2csv(open('./credentials.csv'));

export const options = {
    stages: [
        { duration: '1s', target: 20 },   // Ramp up to 20 TPS in the first 1 seconds
        //{ duration: '1m', target: 20 },    // Maintain 20 TPS for 1 minute
        //{ duration: '30s', target: 0 },    // Ramp down to 0 TPS in the last 30 seconds
    ],
};

export default function () {
    // Iterate through each row in the CSV file
    for (const row of csvData) {
        let username = row.username;
        let password = row.password;

        // Make a POST request to the login endpoint
        let response = http.post('https://dev-jti.sslwireless.com/api/v1/login', {
            username: username,
            password: password,
        });

        // Check if the response status is 200
        check(response, {
            'status is 200': (r) => r.status === 200,
        });

        // Add a short sleep to simulate realistic user behavior
        sleep(1);
    }
}


//notes
//k6 run --rps 20 your_script.js
