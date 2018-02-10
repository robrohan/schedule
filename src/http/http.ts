
export class Http {

  public async fetch<T>(url: string, method: 'GET' | 'POST' = 'GET', body: any = undefined, headers: any = {}): Promise<T> {
    return this.xhr<T>(url, method, headers);
  }

  public xhr<T>(url: string, method: 'GET' | 'POST' = 'GET', body: any = undefined, headers: any = {}): Promise<T> {
    return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();

      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }

      xhr.addEventListener('readystatechange', (x: any) => {
        const target = x.target;
        if (target.readyState === 4 && target.status === 200) {
          resolve(x.target.responseText);
        } else if (target.readyState === 4 && target.status !== 200) {
          reject(x);
        }
      });

      xhr.open(method, url);
      xhr.send(body);
    });
  }

}


