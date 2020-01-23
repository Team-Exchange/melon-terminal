import React, { useEffect, useRef } from 'react';
import * as Yup from 'yup';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import {
  TokenDefinition,
  ExchangeDefinition,
  Hub,
  Trading,
  ExchangeIdentifier,
  OasisDexTradingAdapter,
  OasisDexExchange,
  ZeroExV2TradingAdapter,
  ZeroExV2Order,
} from '@melonproject/melonjs';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { Dropdown } from '~/storybook/components/Dropdown/Dropdown';
import { Button } from '~/storybook/components/Button/Button';
import { Input } from '~/storybook/components/Input/Input';
import { OrderbookItem } from '../FundOrderbook/utils/aggregatedOrderbook';
import { useAccount } from '~/hooks/useAccount';
import { OasisDexOrderbookItem } from '../FundOrderbook/utils/matchingMarketOrderbook';
import { useForm, FormContext } from 'react-hook-form';
import { BlockActions } from '~/storybook/components/Block/Block';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';

export interface FundOrderbookMarketFormProps {
  address: string;
  asset?: TokenDefinition;
  exchanges: ExchangeDefinition[];
  order?: OrderbookItem;
  unsetOrder: () => void;
}

interface FundOrderbookMarketFormValues {
  quantity: string;
}

export const FundOrderbookMarketForm: React.FC<FundOrderbookMarketFormProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount()!;
  const refetch = useOnChainQueryRefetcher();
  const transaction = useTransaction(environment, {
    onFinish: receipt => {
      props.unsetOrder();
      return refetch(receipt.blockNumber);
    },
  });

  const exchanges = props.exchanges.map(item => ({
    value: item.id,
    name: item.name,
  }));

  const exchange = (props.exchanges.find(item => item.id === props.order?.exchange) ?? props.exchanges[0]).id;
  const direction = props.order?.side === 'bid' ? 'sell' : 'buy';
  const directions = [
    {
      value: 'buy',
      name: 'Buy',
    },
    {
      value: 'sell',
      name: 'Sell',
    },
  ];

  const quantity = useRef(props.order?.quantity);
  const form = useForm<FundOrderbookMarketFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      quantity: '',
    },
    validationSchema: Yup.object().shape({
      quantity: Yup.string()
        .required()
        .test('max', 'Maximum quantity exceeded', value => {
          if (!quantity.current) {
            return false;
          }

          return quantity.current!.isGreaterThanOrEqualTo(value);
        }),
    }),
  });

  useEffect(() => {
    quantity.current = props.order?.quantity;
    form.setValue('quantity', props.order?.quantity.toString() ?? '');
  }, [props.order?.quantity.toString()]);

  const submit = form.handleSubmit(async values => {
    const order = props.order!;
    const hub = new Hub(environment, props.address);
    const trading = new Trading(environment, (await hub.getRoutes()).trading);
    const exchange = environment.getExchange(order.exchange);
    const taker = props.order!.side === 'bid' ? props.asset! : environment.getToken('WETH');

    if (exchange.id === ExchangeIdentifier.OasisDex) {
      const market = new OasisDexExchange(environment, exchange.exchange);
      const adapter = await OasisDexTradingAdapter.create(trading, exchange.exchange);
      const offer = await market.getOffer((order as OasisDexOrderbookItem).order.id);
      const quantity = !offer.takerQuantity.isEqualTo(values.quantity)
        ? toTokenBaseUnit(values.quantity, taker.decimals).multipliedBy(order.price)
        : undefined;

      const tx = adapter.takeOrder(account.address!, order.order.id, offer, quantity);
      return transaction.start(tx, 'Take order');
    }

    if (order.exchange === ExchangeIdentifier.ZeroExV2) {
      const adapter = await ZeroExV2TradingAdapter.create(trading, exchange.exchange);
      const offer = order.order as ZeroExV2Order;
      const quantity = !offer.takerAssetAmount.isEqualTo(values.quantity)
        ? toTokenBaseUnit(values.quantity, taker.decimals).multipliedBy(order.price)
        : undefined;

      const tx = adapter.takeOrder(account.address!, order.order, quantity);
      return transaction.start(tx, 'Take order');
    }
  });

  return (
    <FormContext {...form}>
      {props.order && (
        <form onSubmit={submit}>
          <Dropdown name="direction" label="Buy or sell" options={directions} disabled={true} value={direction} />
          <Dropdown name="exchange" label="Exchange" options={exchanges} disabled={true} value={exchange} />
          <Input type="text" name="quantity" label="Quantity" max={props.order.quantity.toFixed()} />
          <Input type="text" name="price" label="Price" disabled={true} value={props.order.price.toFixed()} />

          <BlockActions>
            <Button type="button" onClick={submit}>
              Submit
            </Button>
          </BlockActions>
        </form>
      )}

      {!props.order && <>Please select an order.</>}

      <TransactionModal transaction={transaction} />
    </FormContext>
  );
};
