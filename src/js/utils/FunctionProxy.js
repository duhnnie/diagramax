/**
 * This is the proxier function for this module. It will be binded to an object containing the specific configuration
 * for a certain call.
 * @param  {...any} params An spreaded object with params.
 */
// eslint-disable-next-line consistent-return
function proxyFunction(...params) {
  const {
    context, evaluator, fn, defaultValue,
  } = this;
  let isOK;

  if (typeof evaluator === 'function') {
    isOK = evaluator.call(context);
  }

  if (isOK) {
    return fn.apply(context, params);
  }

  return defaultValue;
}

/**
 * Util for proxy functions. You could want to execute a function only when certain conditions are meet but you want to
 * keep this function separated from the evaluation logic. Use this util for that.
 */
export default {
  /**
   * Returns a new function that is proxying the supplied one. The proxied function will only be executed if certains
   * conditions are meet.
   * @param {Function} fn The function to be proxied. If last param (target) is supplied, the it will be executed in
   * that context, so in that case it won't be necessary to bind it to another target.
   * @param {Function} evaluator The evaluator for determine if the fn function will be executed. It will be executed
   * and the value that it returns will determine the execution of the proxied function.
   * @param {Object} [context=null] The context to be called the function to be proxied, and the context in which the
   * evaluator will be called. Remember that if any of the functions (fn, evaluator) are binded to any other object,
   * providing a context will be useful.
   * @param {any} [defaultValue=null] The value to return in case the evaluation doesn't pass.
   */
  get: (fn, evaluator, context = null, defaultValue = null) => proxyFunction.bind({
    fn,
    evaluator,
    context,
    defaultValue,
  }),
};
