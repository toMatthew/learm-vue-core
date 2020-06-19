/////未看完

/***
如何对数组进行劫持
***/


import { def } from '../util/index'
/***
/**
 * Define a property.
 * 为对象的属性赋值默认属性
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true, // 属性的值，也就是上面的 value，才能被赋值运算符改变。
    configurable: true /// 该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除
  })
}
***/

// 继承array的方法,这么做的目的是不污染全局array
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)


// 劫持数组那些方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
