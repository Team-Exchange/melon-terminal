import md5 from 'md5';
import { Context } from '~/graphql';

export const loadCached = <A extends any[], T extends (...args: A) => any>(
  context: Context,
  cacheKey: ((...args: A) => string) | string,
  loadFn: T
): ((...args: A) => ReturnType<T>) => {
  // Decorate the passed loader function so that whenever it is
  // called, we first check the cache for the current block and the
  // given cache key before forwarding the query.
  return (...args: A): ReturnType<T> => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
    const suffix = typeof cacheKey !== 'function' && args && args.length ? `:${md5(JSON.stringify(args))}` : '';
    const prefix = `${context.network}:${context.block}:`;

    const lookup = prefix + key + suffix;
    if (context.cache.has(lookup)) {
      return context.cache.get(lookup)!;
    }

    const promise = loadFn(...args);
    context.cache.set(lookup, promise);
    return promise;
  };
};
