import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Participation } from '@melonproject/melonjs';
import { AllowedInvestmentAsset } from '@melonproject/melongql';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { Button } from '~/storybook/components/Button/Button';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import {
  CheckboxContainer,
  CheckboxInput,
  CheckboxMask,
  CheckboxIcon,
  CheckboxLabel,
} from '~/storybook/components/Checkbox/Checkbox';
import { useAccount } from '~/hooks/useAccount';
import { useFundInvestmentAssetsQuery } from '~/queries/FundInvestmentAssets';
import { Grid, GridRow, GridCol } from '~/storybook/components/Grid/Grid';
import { FormField } from '~/storybook/components/FormField/FormField';

export interface InvestmentAssetsProps {
  address: string;
}

export interface InvestmentAssetsForm {
  assets: string[];
}

export const InvestmentAssets: React.FC<InvestmentAssetsProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const refetch = useOnChainQueryRefetcher();
  const [details, query] = useFundInvestmentAssetsQuery(address);
  const [addAssets, setAddAssets] = useState<string[]>([]);
  const [removeAssets, setRemoveAssets] = useState<string[]>([]);

  const transaction = useTransaction(environment, {
    onFinish: receipt => refetch(receipt.blockNumber),
    onAcknowledge: () => {
      if (removeAssets?.length) {
        setRemoveAssets([]);
      } else if (addAssets?.length) {
        setAddAssets([]);
      }
    },
  });

  const validationSchema = Yup.object().shape({
    assets: Yup.array<string>().compact(),
  });

  const form = useForm<InvestmentAssetsForm>({
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const allowedAssets = details?.fund?.routes?.participation?.allowedAssets || [];
  const defaultValues = useMemo(
    () =>
      environment.tokens.map(token =>
        allowedAssets?.some((allowed: AllowedInvestmentAsset) => allowed && allowed.token!.symbol === token.symbol)
      ),
    [environment, allowedAssets]
  );

  useEffect(() => {
    const participationAddress = details?.fund?.routes?.participation?.address;
    const participation = new Participation(environment, participationAddress);

    if (removeAssets.length) {
      form.clearError('assets');
      const tx = participation.disableInvestment(account.address!, removeAssets);
      transaction.start(tx, 'Remove assets');
    } else if (addAssets.length) {
      form.clearError('assets');
      const tx = participation.enableInvestment(account.address!, addAssets);
      transaction.start(tx, 'Add assets');
    }
  }, [addAssets, removeAssets]);

  const submit = form.handleSubmit(async data => {
    const assetsToAdd = data.assets.filter(
      selected => selected && !allowedAssets?.some(available => available.token!.address === selected)
    );

    const assetsToRemove = (allowedAssets || [])
      .filter(asset => !data.assets.some(selected => selected === asset.token!.address))
      .map(item => item.token!.address) as string[];

    setRemoveAssets(assetsToRemove);
    setAddAssets(assetsToAdd);

    if (!removeAssets.length && !addAssets.length) {
      form.setError('assets', 'noChanges', 'No changes detected');
    }
  });

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Define investment assets</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  return (
    <Block>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <SectionTitle>Define investment assets</SectionTitle>

          <p>Investors will be able to invest in your funds using any of the assets selected below.</p>

          <Grid>
            <GridRow>
              {environment.tokens
                .filter(token => !token.historic)
                .map((token, index) => (
                  <GridCol xs={12} sm={12} md={6} key={token.symbol}>
                    <FormField name="asset">
                      <CheckboxContainer>
                        <CheckboxInput
                          defaultChecked={defaultValues[index]}
                          id={`assets[${index}]`}
                          type="checkbox"
                          name={`assets[${index}]`}
                          value={token.address}
                          key={token.address}
                          ref={form.register}
                        />
                        <CheckboxMask>
                          <CheckboxIcon />
                        </CheckboxMask>
                        <CheckboxLabel htmlFor={`assets[${index}]`}>
                          {token.symbol} ({token.name})
                        </CheckboxLabel>
                      </CheckboxContainer>
                    </FormField>
                  </GridCol>
                ))}
            </GridRow>
          </Grid>

          <BlockActions>
            <Button type="button" onClick={submit}>
              Set investment assets
            </Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction} />
    </Block>
  );
};

export default InvestmentAssets;
