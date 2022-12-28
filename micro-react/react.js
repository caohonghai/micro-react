const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            // child 有可能是 string 或者 number
            children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
        }
    };
}

// 如果是 string 或者 number 就创建一个特殊类型 TEXT_ELEMENT
const createTextElement = (text) => {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    };
}

export default {
    createElement
};