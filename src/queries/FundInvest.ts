import gql from 'graphql-tag';
import { useOnChainQuery } from '~/hooks/useQuery';
import { useAccount } from '~/hooks/useAccount';

export interface FundInvestQueryVariables {
  fund: string;
  account?: string;
}

const FundHoldingsQuery = gql`
  query useFundInvestQuery($account: Address!, $fund: Address!) {
    account(address: $account) {
      participation(address: $fund) {
        address
        hasInvested
        investmentRequestState
        canCancelRequest
      }
      shares(address: $fund) {
        address
        balanceOf
      }
    }
    fund(address: $fund) {
      routes {
        accounting {
          address
          holdings {
            amount
            shareCostInAsset
            token {
              address
              symbol
              name
              price
              decimals
            }
          }
        }
      }
    }
  }
`;

export const useFundInvestQuery = (fund: string) => {
  const account = useAccount();
  const options = {
    skip: !account.address,
    variables: { fund, account: account.address },
  };

  const result = useOnChainQuery<FundInvestQueryVariables>(FundHoldingsQuery, options);
  return [result.data, result] as [typeof result.data, typeof result];
};
