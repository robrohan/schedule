/**
 * This is used to load workers in typescript. Example is as follows:
 *
 * import * as workerPath from 'file-loader?name=[name].js!./workers/test.worker';
 * ....
 * const runWorkerTest = () => {
 *  const worker = new Worker(workerPath);
 *  worker.addEventListener('message', message => {
 *    console.log(message);
 *  });
 *  worker.postMessage('this is a test message to the worker');
 */
declare module "file-loader?name=[name].js!*" {
  const value: string;
  export = value;
}