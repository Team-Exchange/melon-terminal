import React, { useMemo } from 'react';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { useHistory } from 'react-router';
import { SubmitButton } from '~/components/Common/Form/SubmitButton/SubmitButton';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Hub, Version, Trading } from '@melonproject/melonjs';
import { useAccount } from '~/hooks/useAccount';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { useFundShutdownQuery } from '~/queries/FundShutdown';
import { Spinner } from '~/components/Common/Spinner/Spinner';
import { Holding } from '@melonproject/melongql';

export interface ShutdownProps {
  address: string;
}

export const Shutdown: React.FC<ShutdownProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const refetch = useOnChainQueryRefetcher();
  const [info, _] = useFundShutdownQuery(address);

  const assetsInTrading = useMemo(() => {
    return info.routes?.trading?.lockedAssets;
  }, [info]);

  const hub = new Hub(environment, address);

  const transaction = useTransaction(environment, {
    onFinish: () => refetch(),
    onAcknowledge: async () => {
      if (assetsInTrading) {
        const version = new Version(environment, await hub.getFundVersion());
        const tx = version.shutDownFund(account.address!, address);
        transaction.start(tx, 'Shutdown fund');
      }
    },
  });

  const submit = async () => {
    if (assetsInTrading) {
      const assets = (info!.routes!.accounting!.holdings!.map(holding => holding.token?.address) || []) as string[];

      const trading = new Trading(environment, (await hub.getRoutes()).trading);
      const tx = trading.returnBatchToVault(account.address!, assets);
      transaction.start(tx, 'Return assets to vault');
    } else {
      const version = new Version(environment, await hub.getFundVersion());
      const tx = version.shutDownFund(account.address!, address);
      transaction.start(tx, 'Shutdown fund');
    }
  };

  return (
    <Block>
      <SectionTitle>Shut down fund</SectionTitle>
      {info?.address ? (
        <BlockActions>
          <SubmitButton type="button" label="Shutdown fund" onClick={() => submit()} />
        </BlockActions>
      ) : (
        <Spinner></Spinner>
      )}

      <TransactionModal transaction={transaction} />
    </Block>
  );
};

export default Shutdown;
