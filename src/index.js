/*
 * @Author: maggiehe
 * @Date:   2016-07-19 20:47:09
 * @Last Modified by:   maggiehe
 * @Last Modified time: 2016-07-22 20:48:16
 */

'use strict';
import validator from './validator'
import directive from './directive'

let RegularValidator = function(Component) {
  Component.implement(validator)
    .directive(directive)
};
export default RegularValidator
