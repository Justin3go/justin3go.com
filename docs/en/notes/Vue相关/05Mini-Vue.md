# Mini-vue

```html
<div id="app"></div>
<script>
//vdom 部分
function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}
function mount(vnode, container) {
  const { tag, props, children } = vnode;
  const el = (vnode.el = document.createElement(tag));
  if (props) {
    for (let key in props) {
      const value = props[key];
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          el.append(child);
        } else if (typeof child === "object") {
          mount(child, el);
        }
      });
    } else {
      el.append(children);
    }
  }
  container.append(el);
}

function patch(n1, n2) {
  if (n1.tag === n2.tag) {
    const el = (n2.el = n1.el);
    //diff props

    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    //添加新的属性或更改原来已有但变化了的属性
    for (let key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        el.setAttribute(key, newValue);
      }
    }

    //移除新属性中没有的属性
    for (let key in oldProps) {
      if (!(key in newProps)) {
        el.removeAttribute(key);
      }
    }

    //diff children
    const oldChildren = n1.children;
    const newChildren = n2.children;

    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        if (oldChildren !== newChildren) {
          el.innerHTML = newChildren;
        }
      }
    } else if (typeof oldChildren === "string" && Array.isArray(newChildren)) {
      el.innerHTML = "";
      newChildren.forEach((child) => mount(child, el));
    } else if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
      const minLength = Math.min(oldChildren.length, newChildren.length);
      for (let i = 0; i < minLength; i++) {
        patch(oldChildren[i], newChildren[i]);
      }
      if (oldChildren.length === minLength) {
        for (let i = minLength; i < newChildren.length; i++) {
          mount(newChildren[i], el);
        }
      } else {
        for (let i = minLength; i < oldChildren.length; i++) {
          el.removeChild(oldChildren[i].el);
        }
      }
    }
  } else {
    //replace
  }
}

//reactivity 部分
let activeEffect = null;
class Dep {
  subs = new Set();
  depend() {
    if (activeEffect) {
      this.subs.add(activeEffect);
    }
  }
  notify() {
    this.subs.forEach((sub) => sub());
  }
}

function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

const targetMap = new WeakMap();

function getDep(target, key) {
  if (!targetMap.has(target)) {
    targetMap.set(target, new Map());
  }
  const depMap = targetMap.get(target);
  if (!depMap.has(key)) {
    depMap.set(key, new Dep());
  }
  return depMap.get(key);
}

const reactiveHandlers = {
  get(target, key, receiver) {
    // dep
    const dep = getDep(target, key);
    dep.depend();
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const dep = getDep(target, key);
    const ret = Reflect.set(target, key, value, receiver);
    dep.notify();
    return ret;
  },
};

function reactive(raw) {
  return new Proxy(raw, reactiveHandlers);
}


//component 组件实例
//container 要挂载的 dom 元素
function mountApp(component, container) {
  let isMounted = false;
  let oldVdom;
  watchEffect(() => {
    if (!isMounted) {
      //第一次挂载
      oldVdom = component.render();
      mount(oldVdom, container);
      isMounted = true;
    } else {
      //数据变化,要进行更新
      const newVdom = component.render();
      patch(oldVdom, newVdom);
      oldVdom = newVdom;
    }
  });
}

const App = {
  data: reactive({
    count: 0,
  }),
  render() {
    return h("div", null, [
      h(
        "div",
        {
          onClick: () => App.data.count++,
        },
        String(this.data.count)
      ),
    ]);
  },
};
//一个点击自增的计数器
mountApp(App, document.getElementById("app"));

</script>

```


