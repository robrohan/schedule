require('document-register-element');
const html = require('./main.html');
const css = require('../style/main.scss');

import { Http } from '../http/http';
import { CalendarParser } from '../icalendar/parser';

// Gets the template DOM element from the given document
const getTemplate = (doc: any) => {
  const template = doc.querySelector('template');
  if (template && template.content) {
    return template.content;
  }
  return undefined;
};

// Gets the parent document and the host document given the
// browsers version of the document
const getDocuments = (doc: any) => {
  const parentDoc = doc;
  const myDoc = (parentDoc._currentScript || parentDoc.currentScript).ownerDocument;
  return [parentDoc, myDoc];
};

// Date -> String (used for ID selection)
const formatDateLookup = (date: Date): string => {
  if (!date) {
    return '';
  }

  return [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + date.getDate()).slice(-2)
  ].join('');
};

const renderCalendar = (year: number, squares: any): Promise<boolean> => {
  const startDate = new Date(year, 0, 1);
  const iterateDate = new Date();
  iterateDate.setTime(startDate.getTime());

  return new Promise( (resolve, reject) => {
    // TOOD: this is always counting from Sunday
    for (let i = 0; i < 371; i++) {
      // if we roll past the year, break
      if (startDate.getFullYear() !== iterateDate.getFullYear()) {
        break;
      }

      // const level = Math.floor(Math.random() * 3);
      const level = 0;

      if (iterateDate.getDay() !== (i % 7)) {
        squares.insertAdjacentHTML(
          'beforeend',
          `<li data-level="-1"></li>`
        );
      } else {
        // Hook for us to set any events on the calendar
        const date = formatDateLookup(iterateDate);
        squares.insertAdjacentHTML(
          'beforeend',
          `<li id="D${date}"
               data-level="${level}"
               data-pos="${i % 7}-${(Math.max(0, i - 181) > 0 ? 1 : 0)}"
               title="${iterateDate.toDateString()}
           "><div></div></li>`
        );
        iterateDate.setDate(iterateDate.getDate() + 1);
      }
    }
    resolve(true);
  });
};

const parseCalendars = (calendars: string[]): Promise<CalendarParser> => {
  return new Promise( (resolve, reject) => {
    const parser = new CalendarParser();
    const http = new Http();
    try {
      const allPromise = calendars.map(cal => http.xhr<string>(cal));
      Promise.all(allPromise).then( result => {
        result.forEach( r => {
          parser.parse(r);
        });
        resolve(parser);
      });
    } catch (e) {
      reject(e);
    }
  });
};


// Creates our Calculator web component
const createSchedule = (parent: any, template: any) => {
  const Schedule = Object.create(HTMLElement.prototype);
  Schedule.year = new Date().getFullYear();
  Schedule.files = [];

  // Fires when an instance of the element is created
  // important to put DOM reliant things here
  Schedule.createdCallback = function() {
    // Creates the shadow root
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    // Adds a template clone into shadow root
    const clone = parent.importNode(template, true);
    shadowRoot.appendChild(clone);

    // fill in our content
    shadowRoot.querySelector('style').innerHTML = css;
    shadowRoot.querySelector('content').innerHTML = html;

    if (this.hasAttribute('year')) {
      Schedule.year = this.getAttribute('year');
    }

    if (this.hasAttribute('files')) {
      Schedule.files = this.getAttribute('files').split(',');
    }

    // Build the Calendar
    const squares = shadowRoot.querySelector('.squares');
    renderCalendar(Schedule.year, squares).then( (success) => {
      const today = formatDateLookup(new Date());
      const li = shadowRoot.querySelector('#D' + today);
      if (li) {
        li.classList.toggle('today');
      }
    });

    parseCalendars(Schedule.files).then( (cals) => {
      cals.calendar.events.forEach( event => {
        const dateKey = formatDateLookup(event.date);
        const dom = shadowRoot.querySelector('#D' + dateKey);
        if (dom) {
          let level = parseInt(dom.getAttribute('data-level'), 10);
          dom.setAttribute('data-level', ++level);
          const content = dom.querySelector('div');
          const text = document.createElement('div');
          text.innerHTML = [
            event.summary, '<br>',
            event.description.replace(/<.*>/g, '').replace(/(\\n|\\,|\n)/g, '')].join('');
          content.appendChild(text);
        }
      });
    }).catch( error => {
      console.log(error);
    });

  };

  // Fires when an attribute was added, removed, or updated
  Schedule.attributeChangedCallback = function(attr: string, oldVal: string | number, newVal: string | number) {
    switch (attr) {
      case 'year':
        Schedule.year = newVal;
        break;
    }
  };

  return Schedule;
};

////////////////////////////////////////////////////////////////////////
// Web Component stuff
((window: any, document: any) => {
  if (window && document) {
    const [parentDoc, myDoc] = getDocuments(document);
    const template = getTemplate(myDoc);

    if (template) {
      const Schedule = createSchedule(parentDoc, template);
      window.Schedule = parentDoc.registerElement(
        'rohan-schedule',
        { prototype: Schedule }
      );
    } else {
      console.error('Failed to create Component');
    }
  }
})(window, document);
