// import { Message } from '../engine/bus';

const main = (message: MessageEvent) => {
  console.log('in webworker', message.data);

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
