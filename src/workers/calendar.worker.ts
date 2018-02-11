import { Http } from 'http/http';
import { CalendarParser } from 'icalendar/parser';

const http = new Http();
const parser = new CalendarParser();

const main = (message: MessageEvent) => {
  console.log('in webworker', message.data);

  http.xhr<string>('style/assets/2018.ics').then( (v) => {
    parser.parse(v);

    console.log(parser.findEventsById('TS1-8879A068-CE13-4DD3-B7FE-4890126284A8'));
    const searchDate = new Date(Date.parse('2018-01-06'));
    console.log(searchDate);
    console.log(parser.findEventsByDate( searchDate ));
  });

  const response = {
    type: 'worker_response',
    payload: message.data.payload += ' back at ya!'
  };

  postMessage(response);
};

const destroy = () => {
  close(); // <-- kill itself
};

addEventListener('message', main);
