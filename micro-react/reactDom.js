const createDOM = (fiber) => {
    // 当 fiber 类型是 TEXT_ELEMENT 的时候我们创建一个 text 节点而不是普通的节点。
    const dom =
        fiber.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type);
    // fiber 的 properties 赋值给 node
    Object.keys(fiber.props)
        .filter((key) => key !== "children")
        .forEach((name) => {
            dom[name] = fiber.props[name];
        });
    return dom;
};

function updateDOM(dom, prevProps, nextPorps) {
    const isEvent = (key) => key.startsWith('on');
    // 删除已经没有的props
    Object.keys(prevProps)
        .filter((key) => key != 'children' && !isEvent(key))
        // 不在nextProps中
        .filter((key) => !key in nextPorps)
        .forEach((key) => {
            // 清空属性
            dom[key] = '';
        });

    // 添加新增的属性/修改变化的属性
    Object.keys(nextPorps)
        .filter((key) => key !== 'children' && !isEvent(key))
        // 不再prevProps中
        .filter((key) => !key in prevProps || prevProps[key] !== nextPorps[key])
        .forEach((key) => {
            dom[key] = nextPorps[key];
        });

    // 删除事件处理函数
    Object.keys(prevProps)
        .filter(isEvent)
        // 新的属性没有，或者有变化
        .filter((key) => !key in nextPorps || prevProps[key] !== nextPorps[key])
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[key]);
        });

    // 添加新的事件处理函数
    Object.keys(nextPorps)
        .filter(isEvent)
        .filter((key) => prevProps[key] !== nextPorps[key])
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextPorps[key]);
        });
}

const commitRoot = () => {
    // add nodes to dom
    // commit 到 dom 上时，也需要对这个数组 中的 fiber 变更，移除 dom
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    // 记录上次的 fiber 节点
    currentRoot = wipRoot;
    wipRoot = null;
};

const commitWork = (fiber) => {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    // 向上找到存在的 DOM
    let idx = 0;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
        idx++;
    }
    const domParent = domParentFiber.dom;
    // console.log(fiber, domParent, idx);
    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
        // 更新 dom
        updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
};

const commitDeletion = (fiber, domParent) => {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

const render = (element, container) => {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        // 记录旧 fiber 节点
        alternate: currentRoot,
    };
    // 渲染之后需要清空 保存时移除的 dom 节点
    deletions = [];
    nextUnitOfWork = wipRoot;
};

// 下一个需要执行的单元
let nextUnitOfWork = null;
// 正在进行的渲染
let wipRoot = null;
// 上次渲染
let currentRoot = null;
// 要移除的 dom
let deletions = null;

const workLoop = (deadline) => {
    // shouldYield 表示线程繁忙，应该中断渲染
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // timeRemaining 返回当前空闲期的估计剩余毫秒数 检测线程是否繁忙
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    // 重复请求
    requestIdleCallback(workLoop);
};

// 空闲时执行渲染
requestIdleCallback(workLoop);

/**
 * currentUnitOfWork/fiber 当前执行的任务单元
 * 还需要返回下一个执行的任务单元
 */
const performUnitOfWork = (currentUnitOfWork) => {
    const isFunctionComponent = currentUnitOfWork.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(currentUnitOfWork);
    } else {
        updateHostComponent(currentUnitOfWork);
    }
    // TODO return next unit of work
    if (currentUnitOfWork.child) {
        return currentUnitOfWork.child;
    }
    let newUnitOfWork = currentUnitOfWork;
    while (newUnitOfWork) {
        if (newUnitOfWork.sibling) {
            return newUnitOfWork.sibling;
        }
        newUnitOfWork = newUnitOfWork.parent;
    }
};

let wipFiber = null;
let hookIndex = null;

const updateFunctionComponent = (fiber) => {
    wipFiber = fiber;
    // 初始化 hook 相关的内容
    hookIndex = 0;
    // 用数组方便在同一个函数组件中多次调用 useState
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

// useState hook
export const useState = inital => {
    // 旧 hook
    const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
    // 新 hook
    const hook = {
        // state: 函数组件的状态
        state: oldHook ? oldHook.state : inital,
        queue: []
    };
    // 执行actions，并且更新state
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
        if (action instanceof Function) {
            hook.state = action(hook.state);
        } else {
            hook.state = action;
        }
    })
    const setState = action => {
        hook.queue.push(action)
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot;
        deletions = [];
    }
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}

const updateHostComponent = (fiber) => {
    // TODO add dom node
    // 如果没有节点就创建一个节点
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    }
    // TODO create new fibers
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);
}

// 调和旧的 fiber 节点和新的 react element
// 迭代 react element 数组同时 会迭代旧的 fiber 节点 wipFiber.alternate
const reconcileChildren = (wipFiber, elements) => {
    // 如果有alternate，就返回它的child，没有，就返回undefined
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    let index = 0;
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        let newFiber = null;
        // 如果新旧节点上类型相同可以直接复用旧 DOM 修改上面的属性。
        const sameType = oldFiber && element && element.type === oldFiber.type;
        if (sameType) {
            // update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }
        // 类型不同，新增 DOM 节点
        if (element && !sameType) {
            // add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            };
        }
        // 类型不同 删除旧 DOM 节点
        if (oldFiber && !sameType) {
            // delete the oldFiber's node
            // 旧的 fiber 上添加标记
            oldFiber.effectTag = "DELETION";
            // 当我们提交整棵树的变更到 dom 上时，并不会遍历旧的 fiber
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        if (index === 0) {
            wipFiber.child = newFiber;
        } else if (element) {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
};

export default {
    render,
};
