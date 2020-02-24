/**
 * @ignore
 * This is the proxier function for this module. It will be binded to an object containing the
 * specific configuration for a certain call.
 * @param  {...any} params An spreaded object with params.
 */
function proxyFunction(...params) {
  const { target, evaluator, fn } = this;
  const targetEval = target[evaluator];
  let isOK;

  if (typeof evaluator === 'function') {
    isOK = evaluator();
  } else if (typeof targetEval === 'function') {
    isOK = targetEval();
  } else {
    isOK = targetEval;
  }

  if (isOK) {
    return fn.apply(target, params);
  }
}

/**
 * Util for proxy functions. You could want to execute a function only when certain conditions are
 * meet but you want to keep this function separated from the evaluation logic.
 * Use this util for that.
 */
export default {
  /**
   * Returns a new function that is proxying the supplied one. The proxied function will only be
   * executed if certains conditions are meet.
   * @param {Function} fn The function to be proxied. If last param (target) is supplied, the it
   * will be executed in that context, so in that case it won't be necessary to bind it to another
   * target.
   * @param {String|Function} evaluator The evaluator for determine if the fn function will be
   * executed. It can be a String or a Function. If it's a String so target param should be
   * supplied since the string will be the target property to be evaluated for determining if the
   * proxied function will be executed. If it's a Function it will be executed and the value that
   * it returns will determine the execution of the proxied function.
   * @param {Object} [target] It can have 2 uses: if fn function param is not binded to other
   * object, it will be called in the target context. If evaluator param is a string then it will
   * be assume to be a property of target and it will be evaluated.
   */
  get: (fn, evaluator, target = null) => proxyFunction.bind({
    fn,
    evaluator,
    target,
  }),
};
