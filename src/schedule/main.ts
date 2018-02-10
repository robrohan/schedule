require('document-register-element');
const html = require('./main.html');
const css = require('../style/main.scss');

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

// const showDialog = (curtain: any) => {
//   // TODO: this is dodgy, but setting a class has no effect because we are in a
//   // component
//   try {
//     document.body.style = 'overflow: hidden;';
//   } catch (e) {
//     // This doesn't work on safari 10 (and it shouldn't really)
//     // its here to keep the background from scrolling
//   }
//   curtain.classList.toggle('show');
// };

// const hideDialog = (curtain: any) => {
//   // TODO: this is dodgy, but setting a class has no effect because we are in a
//   // component
//   try {
//     document.body.style = '';
//   } catch (e) {
//     // This doesn't work on safari 10 (and it shouldn't really)
//     // its here to keep the background from scrolling
//   }
//   curtain.classList.toggle('show');
// };

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
        squares.insertAdjacentHTML(
          'beforeend',
          `<li data-level="${level}" title="${iterateDate.toDateString()}"></li>`
        );
        iterateDate.setDate(iterateDate.getDate() + 1);
      }
    }
    resolve(true);
  });
};


// Creates our Calculator web component
const createSchedule = (parent: any, template: any) => {
  const Schedule = Object.create(HTMLElement.prototype);
  Schedule.year = new Date().getFullYear();

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

    // const button = shadowRoot.querySelectorAll('.js-open-dialog');
    // const curtain = shadowRoot.querySelector('.js-curtain');

    // button.forEach( (b: any) => {
    //   b.addEventListener('click', (evt: Event) => {
    //     showDialog(curtain);
    //   });
    //   b.addEventListener('touch', (evt: Event) => {
    //     showDialog(curtain);
    //   });
    // });
    // curtain.addEventListener('click', (evt: Event) => hideDialog(curtain));

    if (this.hasAttribute('year')) {
      Schedule.year = this.getAttribute('year');
    }

    console.log(Schedule.year);
    const squares = shadowRoot.querySelector('.squares');
    renderCalendar(Schedule.year, squares).then( (success) => {
      console.log('Done');
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
