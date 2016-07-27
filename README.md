# regular-validator

A mixin for RegularJS

这个插件用来验证数据。可以将规则声明在任意标签上（表单元素，div，img，...），支持自定义验证，支持关联验证。

This plugin is aim to verify data. So it not only support the validation of form elements, but can validate data on all elements(eg: div, img). Custom validation and correlating validation are supported too.

# Installation

	npm install regular-validator
	# or
	bower install regular-validator

# How to use
### use RegularValidator as a mixin

```js
import Validator from 'regular-validator'
let Comp = Regular.extend({
	// ...
}).use(Validator)
// ...
```

### add rules on the HTML tags

* common validate (input/select/textarea)

```html
<!--use 'name' or 'data-name' assign a name-->
<input name="phone" type="text" r-validator={phone} r-required="required" r-type='number'/>

<!--results-->
<!--if id is invalid-->
{#if validation.id.invalid}<p>Phone must be number.</p>{/if}
<!--if the rule(required/type/...) is invalid-->
{#if validation.id.required}<p>Phone is required.</p>{/if}
{#if validation.id.type}<p>Phone must be number.</p>{/if}

```

* or on other tags (img/div/...)

```html
<img name='img' src={img} r-validator={img} r-required="required" />
```

* custom validate method, returns result of bool type

```html
 <input name="email" type="email" r-validator={email}  r-custom={this.validateEmail(email)}/>
```

```js
// js
// ...
// email is invalid when it returns false
validateEmail(email) {
  return email == 'hello@163.com'
},
// ...
```

* correlating validation, correlate variables changes will also trigger the validation

```html
<!--either startTime or endTime's change can trigger the validation of the endTime-->
<input name="endtime" type='text' r-validator={endTime} r-related={startTime} r-custom={this.validate()}/>
```

```js
// js
// ...
validate() {
  var data = this.data;
  return data.startTime < data.endTime;
},
// ...
```

# Built-in rules

```
required, type, length, min, max, pattern, custom
```

### priority

```
required > type > length > min > max > pattern > custom
```

### built-in types

```
iso_date, url, email, number, date, time
```

# Result structure

* field result (data.validation[fieldname])

```json
{
  "origin": "",
  "element": {},
  "name": "email",
  "handler": [{
    "priority": 1,
    "directive": "r-required"
  }, {
    "priority": 2,
    "directive": "r-type"
  }, {
    "priority": 200,
    "directive": "r-custom"
  }],
  "model": {
    "type": "expression",
    "body": "c._sg_('email', d, e)",
    "constant": false,
    "setbody": null
  },
  "untouched": false,
  "touched": true,
  "modified": true,
  "dirty": true,
  "pristine": false,
  "invalid": false,
  "valid": false,
  "required": false,
  "type": false,
  "custom": false
}
```

* validator summary result (data.validation)

```json
{
  "untouched": false,
  "touched": true,
  "modified": true,
  "dirty": true,
  "pristine": false,
  "invalid": false,
  "valid": false
}
```

