import BigNumber from 'bignumber.js';
import { fromWei } from 'web3-utils';
import { Hub, PerformanceFee } from '@melonproject/melonjs';
import { Resolver } from '~/graphql';

export const rate: Resolver<[Hub, PerformanceFee]> = async ([hub, performance], _, context) => {
  const rate = await performance.getPerformanceFeeRate(hub.contract.address, context.block);
  return new BigNumber(fromWei(rate.toFixed()));
};

export const period: Resolver<[Hub, PerformanceFee]> = ([hub, performance], _, context) => {
  return performance.getPerformanceFeePeriod(hub.contract.address, context.block);
};
