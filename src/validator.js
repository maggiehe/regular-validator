/*
 * @Author: maggiehe
 * @Date:   2016-07-21 16:01:27
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-07-26 17:16:50
 * 验证功能：监听、状态管理、信息收集
 */

'use strict';
import Regular from 'regularjs'
import util from './util'
import { INITIAL_STATUS } from './const'

let dom = Regular.dom

// 验证项失焦处理
let blurHandle = function(field) {
  if (field.untouched) {
    field.untouched = false
    field.touched = true
    this.calcStatus() //验证项状态变化时，需要重新计算validation总状态
  }
  if (!field.dirty) { //dirty前blur，需要验证
    this.checkValidity(field.name)
  }
  // this.$update() //todo:是否需要
}

// 验证项watch处理
let watchHandle = function(field) {
  if (field.origin !== this.$get(field.model) && !field.dirty) {
    field.dirty = true
    this.calcStatus()
  }
  if (field.origin === this.$get(field.model)) {
    field.pristine = true
    field.modified = false
    this.calcStatus()
  } else {
    field.pristine = false
    field.modified = true
    this.calcStatus()
  }
  if (field.dirty) {
    this.checkValidity(field.name)
  }
}

let validator = {
  events: {
    $config() {
      let data = this.data
      Object.assign(data.validation = {}, INITIAL_STATUS, { __fields: [] }) // 初始化validation的状态
    }
  },
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
      if (item.invalid === true) validation.invalid = true; //任一
      if (item.valid === false) validation.valid = false; //所有true才为true
    });
  },
  // 状态重置
  resetStatus(name) {
    // todo: 暂时用不到
  },
  //添加验证项
  addField(name, element, model) {
    let data = this.data

    // 初始化验证项
    data.validation[name] = {}
    let field = data.validation[name]
    Object.assign(field,
      INITIAL_STATUS, {
        origin: this.$get(model), //记录model原始值
        element: element,
        name: name,
        model: model
      })
    this.calcStatus()

    // 添加事件监听
    this.addValidator(name)

    // 记录该项
    data.validation.__fields = data.validation.__fields || []
    let fields = data.validation.__fields
    if (!~fields.indexOf(name)) fields.push(name)
  },
  // 移除验证项
  removeField(name) {
    let data = this.data,
      field = data.validation[name]
    if (!field) return

    // 取消事件监听
    this.removeValidator(name)
    this.removeRelated(name)

    // 不再记录该项
    let fields = data.validation.__fields,
      index = fields.indexOf(name)
    if (~index) {
      fields.splice(index, 1)
    }

    delete data.validation[name]
  },
  // 添加验证监听
  addValidator(name) {
    let data = this.data,
      validation = data.validation
    validation[name] = validation[name] || {}
    validation[name].__watchers = validation[name].__watchers || []
    let field = validation[name]

    dom.on(field.element, 'blur', blurHandle.bind(this, field));
    field.__watchers[0] = this.$watch(field.model, watchHandle.bind(this, field))
  },
  // 移除验证项
  removeValidator(name) {
    let data = this.data,
      field = data.validation[name]

    if (!field) return

    dom.off(field.element, 'blur', blurHandle.bind(this, field))
    this.$unwatch(field.__watchers[0])

    // this.removeField(name)
  },
  // 添加依赖验证监听
  addRelated(name, element, model) {
    let data = this.data,
      validation = data.validation
    validation[name] = validation[name] || {}
    validation[name].__watchers = validation[name].__watchers || []
    let field = validation[name]

    field.related = model
    field.__watchers[1] = this.$watch(model, watchHandle.bind(this, field))
  },
  // 移除依赖验证监听
  removeRelated(name) {
    let data = this.data,
      field = data.validation[name]
    if (!field) return
    field.__watchers[1] && this.$unwatch(field.__watchers[1])
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
      handlers.splice(index, 1);
      delete field[util.getValidationType(directive)]
      this.checkValidity(name) //是不是可以更简单
    }
  },

  // 验证
  checkValidity(name) {
    let data = this.data
    if (!name) {
      let fields = data.validation.__fields
      fields.forEach(field => {
        this.checkValidity(field)
      });
    } else {
      let invalid,
        field = data.validation[name],
        model = this.$get(field.model)

      //handlers名字要不要改
      field.invalid = false
      field.handlers && field.handlers.forEach(item => {
        // 如果验证失败，重置后面所有低PRIORITY规则的验证结果
        if (field.invalid) {
          field[util.getValidationType(item.directive)] = false
          return
        }
        invalid = !item.handler(model) //如果验证方法返回false，非法
        field[util.getValidationType(item.directive)] = invalid
        if (invalid) {
          field.invalid = true
        }
      })
    }
    this.calcStatus()
  }
}
export default validator
