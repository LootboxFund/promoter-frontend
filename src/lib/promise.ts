/** Used to inject a chain in the synchronous invocations of a promise array */
export const promiseChain = async (promises: (Promise<any> | undefined)[], delay: number = 100) => {
  const res = [];
  for (const promise of promises) {
    if (promise == undefined) {
      res.push(undefined);
      continue;
    }
    const promiseResult = await promise;
    res.push(promiseResult);
    await new Promise((res) => {
      setTimeout(() => {
        return res(null);
      }, delay);
    });
  }
  return res;
};
