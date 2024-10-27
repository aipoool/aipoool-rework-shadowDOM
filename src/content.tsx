import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './components/Extension';

const injectExtension = () => {
  const extensionRoot = document.createElement('div');
  extensionRoot.id = 'linkedin-extension-root';
  document.body.appendChild(extensionRoot);

  const shadowRoot = extensionRoot.attachShadow({ mode: 'open' });
  const shadowContainer = document.createElement('div');
  shadowContainer.id = 'extension-container';
  shadowRoot.appendChild(shadowContainer);

  const style = document.createElement('style');
  style.textContent = `
    #extension-container {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 2147483647;
    }
    #extension-container * {
      all: unset;
      box-sizing: border-box;
    }
  `;
  shadowRoot.appendChild(style);

  ReactDOM.render(<Extension />, shadowContainer);
};

injectExtension();