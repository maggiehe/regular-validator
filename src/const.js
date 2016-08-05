/*
 * @Author: maggiehe
 * @Date:   2016-07-21 16:18:11
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-08-02 23:10:03
 */

'use strict';
// 表单元素
export const FORM_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT']

// 验证优先级（数字越小优先级越高）
export const PRIORITY = {
  required: 1,
  type: 2,
  length: 3,
  min: 4,
  max: 5,
  pattern: 100,
  custom: 200
}

// 保留关键字
export const KEYWORDS = ['untouched', 'touched', 'modified', 'dirty', 'pristine', 'invalid', 'valid', 'errors', '__fields', '__watcher']

// 验证初始状态
export const INITIAL_STATUS = {
  untouched: true,
  touched: false,
  modified: false,
  dirty: false,
  pristine: true,
  invalid: false,
  valid: false
}

// 验证模式
export const VALIDATION_MODES = {
  blur: 0,
  change: 1,
  watch: 2
}
