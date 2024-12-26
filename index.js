const express = require('express');
const twilio = require('twilio');
require('dotenv').config();
const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(express.json());

const PORT = process.env.PORT || 3000;
const url = process.env.BASE_URL

app.get('/start-call/:delay?', (req, res) => {
  const toNumber = '+918972160828'; 
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  // Parse delay from route parameter, default to 0 if not provided or invalid
  let delay = parseInt(req.params.delay, 10);
  if (isNaN(delay) || delay < 0) {
    delay = 0;
  }

  // Schedule the call
  setTimeout(() => {
    client.calls.create({
      to: toNumber,
      from: fromNumber,
      url: `${url}/initial-twiml`, // URL for the TwiML to execute when the call is answered
    })
    .then(call => {
      console.log(`Call initiated to ${toNumber}, SID: ${call.sid}`);
    })
    .catch(error => {
      console.error('Error initiating call:', error);
    });
  }, delay * 1000); 

  res.send(`Call to ${toNumber} will be made after a delay of ${delay} seconds.`);
});

app.post('/initial-twiml', (req, res) => {
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>Hello, this is your scheduled call. Please hang up when you are done.</Say>
      <Pause length="60" />
      <Redirect>/initial-twiml</Redirect>
    </Response>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
