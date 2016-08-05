/*
 * @Author: maggiehe
 * @Date:   2016-07-21 16:19:46
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-08-03 00:00:56
 */

'use strict';
import { FORM_ELEMENTS } from './const'
let util = {
  // 是否是表单元素
  isFormElement(tagName) {
    tagName = (tagName || '').toUpperCase()
    return !!~FORM_ELEMENTS.indexOf(tagName)
  },
  // 是否是checkbox或radio
  isCheckElement(element) {
    return element.tagName === 'INPUT' && /^checkbox|radio$/.test(element.type)
  },
  // 获取指令表达式
  getDirectiveExpression(attrs, dname) {
    let expression = null
    attrs.some(function(attr) {
      if (attr.name === dname) {
        expression = attr.value
      }
    })
    return expression
  },
  // 获取表达式的值
  getExpressionValue(expression) {
    if (expression && expression.type && expression.type.toLowerCase() === 'expression') {
      return this.$get(expression)
    }
    return expression //参数为常量
  },
  // 根据指令名获取验证类型'r-required' => 'required'
  getValidationType(dName) {
    return dName.split('-')[1].toLowerCase()
  },
  // 获取验证项的name（name用来标识验证的项，是必须的）
  getFieldName(element) {
    let name = element.getAttribute('name') || element.getAttribute('data-name')
    if (!name) {
      throw Error("you need specified a name for the validation field")
    } else {
      return name
    }
  }
}

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

export default util
