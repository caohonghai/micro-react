import React from './micro-react/react';
import ReactDOM from './micro-react/reactDom';
import { useState } from './micro-react/reactDom';
import './style.css';

const container = document.getElementById('root');

/** Basic */
// const element = React.createElement(
//     'div',
//     { style: "background: salmon" },
//     React.createElement('h1', null, 'HelloWorld'),
//     React.createElement('h2', { style: "text-align:right" }, 'from tauysi'),
// )
// ReactDOM.render(element, container);


/** Input */
// const handleChange = (e) => {
//     renderer(e.target.value);
// };
// const renderer = (value) => {
//     const element = React.createElement(
//         'div',
//         { className: 'App' },
//         React.createElement('header', { className: 'App-header' },
//             React.createElement('h2', null, 'Hello ' + value),
//             React.createElement('input', {
//                 value: value,
//                 oninput: (e) => handleChange(e),
//                 className: 'mt'
//             })
//         )
//     );
//     ReactDOM.render(element, container);
// }

// renderer('World');

/** Function Component */
// const App = (props) => {
// return React.createElement(
//     'div',
//     { className: 'App' },
//     React.createElement('header', { className: 'App-header' },
//         React.createElement('h2', null, 'Hello ' + props.name)
//     )
// );
// }

// const element = React.createElement(App, {
//     name: 'World'
// })

// ReactDOM.render(element, container);

/** React Hook */
const Counter = () => {
    const [count, setCount] = useState(0);
    const [value, setValue] = useState(7);
    return React.createElement(
        'div',
        { className: 'App' },
        React.createElement('header', { className: 'App-header' },
            React.createElement('h1', null, 'Counter: ', count),
            React.createElement('input', {
                value: value,
                oninput: (e) => setValue(Number(e.target.value)),
                className: 'mt'
            }),
            React.createElement('div', { className: 'operator mt' },
                React.createElement('button', { onclick: () => setCount(pre => pre + value) }, 'ADD Input (+)'),
                React.createElement('button', { onclick: () => setCount(count - value) }, 'SUB Input (-)'),
            )
        )
    );
}

const element = React.createElement(Counter);
ReactDOM.render(element, container);