/*
 * @Author: maggiehe
 * @Date:   2016-07-29 15:17:58
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-08-04 14:13:46
 * 插件私有方法：监听、状态管理、信息收集
 */

'use strict';
import Regular from 'regularjs'
import util from './util'
import { INITIAL_STATUS, VALIDATION_MODES } from './const'

let dom = Regular.dom

//表单项聚焦监听
let focusHandle = function(field) {
  Object.assign(field, INITIAL_STATUS) // 状态重置
  methods.calcStatus.call(this)
  this.$update()
}

//表单项失焦监听
let formHandle = function(field) {
  if (field.untouched) {
    field.untouched = false
    field.touched = true
  }
  if (field.origin === field.element.value) {
    field.pristine = true
    field.modified = false
  } else {
    field.pristine = false
    field.modified = true
    field.dirty = true
  }
  this.checkValidity(field.name)
  this.$update()
}

// 非表单验证项数据监听
let watchHandle = function(field) {

  if (field.origin === this.$get(field.model)) {
    field.pristine = true
    field.modified = false
    methods.calcStatus.call(this)
  } else {
    field.pristine = false
    field.modified = true
    methods.calcStatus.call(this)
  }
  if (field.origin !== this.$get(field.model) && !field.dirty) {
    field.dirty = true
  }
  if (field.dirty) {
    this.checkValidity(field.name)
  }
}

// 非表单依赖项数据监听
let relatedWatchHandle = function(field) {
  if (field.touched || field.dirty) {
    this.checkValidity(field.name)
  }
}

// 根据标签类型返回不同的验证模式
let getValidationMode = function(element) {
  if (!util.isFormElement(element.tagName)) {
    return VALIDATION_MODES.watch
  } else if (element.tagName === 'SELECT' || util.isCheckElement(element)) {
    return VALIDATION_MODES.change
  }
  return VALIDATION_MODES.blur
}

// 添加验证相关的监听
let addValidator = function(field) {
  field.__watchers = field.__watchers || {}
  let mode = getValidationMode(field.element)
  switch (mode) {
    case VALIDATION_MODES.blur:
      dom.on(field.element, 'focus', focusHandle.bind(this, field));
      dom.on(field.element, 'blur', formHandle.bind(this, field));
      break;
    case VALIDATION_MODES.change:
      dom.on(field.element, 'change', formHandle.bind(this, field));
      break;
    case VALIDATION_MODES.watch:
      field.__watchers.model = this.$watch(field.model, watchHandle.bind(this, field))
      break;
    default:
  }
}

// 移除验证项
let removeValidator = function(field) {
  let mode = getValidationMode(field.element)
  switch (mode) {
    case VALIDATION_MODES.blur:
      dom.off(field.element, 'focus', focusHandle.bind(this, field));
      dom.off(field.element, 'blur', formHandle.bind(this, field));
      break;
    case VALIDATION_MODES.change:
      dom.off(field.element, 'change', formHandle.bind(this, field));
      break;
    case VALIDATION_MODES.watch:
      this.$unwatch(field.__watchers.model)
      break;
    default:
  }
}

let methods = {
  // 根据各项的状态计算validation的总状态
  calcStatus() {
    let data = this.data,
      validation = data.validation,
      fields = data.validation.__fields
    Object.assign(validation, {
      untouched: true,
      touched: true,
      modified: false,
      dirty: false,
      pristine: true,
      invalid: false,
      valid: true
    })
    fields.forEach(field => {
      let item = validation[field]
      if (item.untouched === false) validation.untouched = false; //任一
      if (item.untouched === true) validation.touched = false; //所有true才为true
      if (item.modified === true) validation.modified = true; //任一
      if (item.dirty === true) validation.dirty = true; //任一
      if (item.pristine === false) validation.pristine = false; //所有true才为true
      if (item.invalid !== false) validation.invalid = true; //任一
      if (item.valid === false) validation.valid = false; //所有true才为true
    });
  },
  //添加验证项
  addField(name, element, model) {
    let data = this.data

    // 初始化验证项
    data.validation[name] = data.validation[name] || {}
    let field = data.validation[name]
    Object.assign(field,
      INITIAL_STATUS, {
        origin: this.$get(model), //记录model原始值
        element: element,
        name: name,
        model: model
      })

    // 添加事件监听
    addValidator.call(this, field)

    // 记录该项
    data.validation.__fields = data.validation.__fields || []
    let fields = data.validation.__fields
    if (!~fields.indexOf(name)) fields.push(name)
  },
  // 移除验证项
  removeField(context, name) {
    let data = context.data,
      field = data.validation[name]
    if (!field) return

    // 取消事件监听
    removeValidator.call(context, field)
    this.removeRelated.call(context, name)

    // 不再记录该项
    let fields = data.validation.__fields,
      index = fields.indexOf(name)
    if (~index) {
      fields.splice(index, 1)
    }

    delete data.validation[name]
    this.calcStatus.call(context)
  },
  // 添加依赖验证监听
  addRelated(name, element, model) {
    let data = this.data,
      validation = data.validation
    validation[name] = validation[name] || {}
    validation[name].__watchers = validation[name].__watchers || {}
    let field = validation[name]

    field.related = model
    field.__watchers.related = this.$watch(model, relatedWatchHandle.bind(this, field))
  },
  // 移除依赖验证监听
  removeRelated(name) {
    let data = this.data,
      field = data.validation[name]
    if (!field) return
    field.__watchers.related && this.$unwatch(field.__watchers.related)
  },
  // 为验证项添加规则处理函数
  addRuleHandler(name, handler) {
    let data = this.data,
      validation = data.validation
    validation[name] = validation[name] || {}
    let field = validation[name]
    field.handlers = field.handlers || []
    let handlers = field.handlers

    handlers.push(handler)
    handlers.sort(function(handler0, handler1) {
      return handler0.priority - handler1.priority
    })
  },
  // 为验证项移除规则处理函数
  removeRuleHandler(name, directive) {
    let index = -1,
      data = this.data,
      field = data.validation[name]

    if (!field) return
    let handlers = field.handlers

    // 找到对应的handler
    handlers.forEach(function(handler, i) {
      if (handler.directive === directive) {
        index = i
      }
    })

    if (~index) {
      handlers.splice(index, 1)
      delete field[util.getValidationType(directive)]
      this.checkValidity(name)
    }
  }
}

export default methods
