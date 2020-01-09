import gql from 'graphql-tag';
import { useOnChainQuery } from '~/hooks/useQuery';

export interface FundShutdownQueryVariables {
  address: string;
}

const FundShutdownQuery = gql`
  query FundShutdownQuery($address: String!) {
    fund(address: $address) {
      address
      routes {
        trading {
          lockedAssets
        }
        accounting {
          holdings {
            token {
              address
            }
          }
        }
      }
    }
  }
`;

export const useFundShutdownQuery = (address: string) => {
  const options = {
    variables: { address },
  };

  const result = useOnChainQuery<FundShutdownQueryVariables>(FundShutdownQuery, options);

  const fundShutDownResult = result.data?.fund ?? {};
  return [fundShutDownResult, result] as [typeof fundShutDownResult, typeof result];
};
