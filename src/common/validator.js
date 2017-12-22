  export function range(rule, value, callback) {
    let _value = value;
    if (typeof rule.max !== 'number') {
      throw new Error('rule.max不是数字');
    }

    if (typeof rule.min !== 'number') {
      throw new Error('rule.min不是数字');
    }

    if (typeof value === 'string') {
      _value = parseFloat(value);
      if (isNaN(_value)) {
        callback(new Error(`请输入数字`));
      }
    }

    if (_value > rule.max) {
      callback(new Error(`数字不能大于${rule.max}`));
    }
    if (_value < rule.min) {
      callback(new Error(`数字不能小于${rule.min}`));
    }

    callback();
  }
