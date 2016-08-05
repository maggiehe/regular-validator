/*
 * @Author: maggiehe
 * @Date:   2016-07-21 16:01:27
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-08-05 15:41:31
 * 验证mixin
 */

'use strict';
import Regular from 'regularjs'
import util from './util'
import { INITIAL_STATUS, KEYWORDS } from './const'
import methods from './methods'

let dom = Regular.dom

let validator = {
  events: {
    $config() {
      let data = this.data
      Object.assign(data.validation = {}, INITIAL_STATUS, { __fields: [] })
    }
  },
  // 状态重置
  resetValidation() {
    let validation = this.data.validation
    Object.keys(validation).forEach(key, () => {
      if (!~KEYWORDS.indexOf(key)) {
        Object.assign(validation[key], INITIAL_STATUS)
      }
    })
    Object.assign(validation, INITIAL_STATUS)
  },
  // 验证
  checkValidity(name, noCalc) {
    let data = this.data
    if (!name) {
      let fields = data.validation.__fields
      fields.forEach(field => {
        this.checkValidity(field, true)
      });
    } else {
      let invalid,
        field = data.validation[name],
        element = field.element,
        invalidClass = element.getAttribute('invalid-class') || 'invalid',
        value

      if (util.isCheckElement(element)) {
        value = element.checked
      } else if (util.isFormElement(element.tagName)) {
        value = element.value
      } else {
        value = this.$get(field.model)
      }
      field.invalid = false
      field.handlers && field.handlers.forEach(item => {
        // 如果验证失败，重置后面所有低PRIORITY规则的验证结果
        if (field.invalid) {
          field[util.getValidationType(item.directive)] = false
          return
        }
        let result = item.handler.call(this, value)
        if (typeof result === 'boolean' || result === undefined) {
          invalid = !result // 如果验证方法返回false，非法
        } else {
          invalid = result // 如果返回值非bool型，返回的是错误状态码
        }
        field[util.getValidationType(item.directive)] = invalid
        if (invalid) {
          field.invalid = invalid
          dom.addClass(field.element, field.invalidClass)
          this.$emit('invalid', field)
        } else {
          dom.delClass(field.element, field.invalidClass)
          this.$emit('valid', field)
        }
      })
    }

    !noCalc && methods.calcStatus.call(this)
  }
}
export default validator
