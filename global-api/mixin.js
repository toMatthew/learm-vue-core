/**
  * 合并策略要注意：比如 data,props,methods是同名属性覆盖合并，其他直接合并
  * 而生命周期钩子函数则是将同名的函数放到一个数组中，在调用的时候依次调用
***/
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) { // 传入一个vue实例
    this.options = mergeOptions(this.options, mixin) // parent和child
    return this
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 * 选项覆盖策略是处理的功能
 * 如何合并父选项值和子选项
 * 将值转换为最终值。
 */
const strats = config.optionMergeStrategies; // optionMergeStrategies: Object.create(null),

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 将两个选项对象合并为一个新的对象。
 * 用于实例化和继承的核心实用程序。
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  // 在子选项上应用扩展和混合
  // 但前提是它不是原始选项对象
  // 另一个mergeOptions调用的结果。
  // 只有合并的选项才具有_base属性。
  if (!child._base) { 
    if (child.extends) {// extends只能有一个，所以不用遍历
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }
  
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  
  return options
}

//// 所以这里注意了，如果是自定义钩子的话，使用mixin的话，请手动合并或者调用（比如ssr的asyncData）
function mergeField (key) {
  const strat = strats[key] || defaultStrat // key = [data, el,propsData,hook,watch,props,methods....]
  options[key] = strat(parent[key], child[key], vm, key)
}
