import React from './micro-react/react';
import ReactDOM from './micro-react/reactDom';
import './style.css';

// const element = React.createElement(
//     'div',
//     { style: "background: salmon" },
//     React.createElement('h1', null, 'HelloWorld'),
//     React.createElement('h2', { style: "text-align:right" }, 'from tauysi'),
// )
const container = document.getElementById('root');

const handleChange = (e) => {
    renderer(e.target.value);
};
const renderer = (value) => {
    const element = React.createElement(
        'div',
        { className: 'App' },
        React.createElement('header', { className: 'App-header' },
            React.createElement('h2', null, 'Hello ' + value),
            React.createElement('input', {
                value: value,
                oninput: (e) => handleChange(e),
                className: 'mt'
            })
        )
    );
    ReactDOM.render(element, container);
}

renderer('World');