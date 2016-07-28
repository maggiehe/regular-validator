/*
 * @Author: maggiehe
 * @Date:   2016-07-19 20:51:08
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-07-28 09:55:28
 * 内置的验证方法
 */
'use strict';

let rules = {
  // 必填验证
  required(value, rule) {
    if (rule === 'false' || !rule) {
      return true
    }
    if (value === 0 || value === false) return true
    return !!value
  },
  // 类型验证
  type(value, rule) {
    let types = {
      ISO_DATE: /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
      URL: /^[a-z]+:\/\/(?:[\w-]+\.)+[a-z]{2,6}.*$/i, // See valid URLs in RFC3987 (http://tools.ietf.org/html/rfc3987)
      EMAIL: /^[\w-\.]+@(?:[\w-]+\.)+[a-z]{2,6}$/i,
      NUMBER: /^[\d]+$/i,
      DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
      TIME: /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/
    }

    // 如果没有匹配到任何类型
    if (!types[rule.toUpperCase()]) {
      return true
    }
    return types[rule.toUpperCase()].test(value)
  },
  // 长度验证
  length(value, length) {
    return ('' + value).length === parseInt(length);
  },
  // 最小值验证
  min(value, min) {
    min = parseFloat(min);
    if (isNaN(min)) {
      return true
    }
    // 为空时验证通过
    if (value === null || value === undefined || value === '') {
      return true
    }
    return +value >= min
  },
  // 最大值验证
  max(value, max) {
    max = parseFloat(max);
    if (isNaN(max)) {
      return true
    }
    // 为空时验证通过
    if (value === null || value === undefined || value === '') {
      return true
    }
    return +value <= max
  },
  // 正则验证
  pattern(value, pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern)
    }
    return pattern.test(value || '')
  },
  // 自定义验证
  custom: function(value, method) {
    return method
  }
}
export let validationMethods = rules
export let validationTypes = Object.keys(rules)
