/*
 * @Author: maggiehe
 * @Date:   2016-07-19 20:49:33
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-08-03 00:29:30
 * 内置指令处理
 */
'use strict';
import Regular from 'regularjs'
import util from './util'
import methods from './methods'
import { validationTypes, validationMethods } from './rules'
import { PRIORITY } from './const'

let rModel = Regular.directive("r-model")

// 定义r-validator指令
let directives = {
  'r-validator': {
    link(element, value, dname, attrs) {
      let data = this.data,
        name = util.getFieldName(element)
      if (data.validation[name] && data.validation[name].name) {
        throw Error("duplicated validation field name: " + name)
      }
      if (!!name) {
        methods.addField.call(this, name, element, value)
      }
      //为表单元素添加r-model绑定
      if (util.isFormElement(element.tagName)) {
        let recycle = rModel.link.apply(this, arguments)
        return () => {
          methods.removeField(this, name)
          recycle()
        }
      }
    }
  },
  'r-related': {
    link(element, value, dname, attrs) {
      let validation = this.data.validation,
        name = util.getFieldName(element),
        rValidator = validation[name] && validation[name].model || util.getDirectiveExpression(attrs, 'r-validator')
      if (!rValidator) return // 如果没有r-validator指令，所有验证规则将被忽略
      if (!!name) {
        methods.addRelated.call(this, name, element, value)
      }
      return () => {
        methods.removeRelated.call(this, name)
      }
    }
  }
}

// 规则指令的link方法
let ruleLink = function(element, dValue, dName, attrs) {
  let validation = this.data.validation,
    name = util.getFieldName(element),
    validationType = util.getValidationType(dName),
    rValidator = validation[name] && validation[name].model || util.getDirectiveExpression(attrs, 'r-validator')

  if (!rValidator) return // 如果没有r-validator指令，所有验证规则将被忽略

  methods.addRuleHandler.call(this, name, {
    priority: PRIORITY[validationType],
    directive: dName,
    handler: function(model) {
      let rule = util.getExpressionValue.call(this, dValue)
      return validationMethods[validationType](model, rule)
    }
  });
  return () => {
    methods.removeRuleHandler.call(this, name, dName);
  }
}

// 定义规则指令
validationTypes.forEach(type => {
  directives['r-' + type] = {
    link: ruleLink
  }
})

export default directives
