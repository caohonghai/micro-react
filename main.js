import React from './micro-react/react';
import ReactDOM from './micro-react/reactDom';
import './style.css';

const element = React.createElement(
    'div',
    { style: "background: salmon" },
    React.createElement('h1', null, 'HelloWorld'),
    React.createElement('h2', { style: "text-align:right" }, 'from tauysi'),
)
console.log(element);

const container = document.getElementById('root');
ReactDOM.render(element, container);