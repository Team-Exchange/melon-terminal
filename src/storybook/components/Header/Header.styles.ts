import styled from 'styled-components';

export const HeaderPosition = styled.div`
  position: fixed;
  top: 0;
  z-index: 200;
  width: 100%;
  padding: ${props => props.theme.spaceUnits.l} ${props => props.theme.spaceUnits.s};
  border-bottom: ${props => props.theme.border.borderDefault};
  background-color: ${props => props.theme.mainColors.primary};
`;
export const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  @media (${props => props.theme.mediaQueries.m}) {
    justify-content: flex-end;
  }
`;

export const LogoContainer = styled.div`
  position: relative;
  @media (${props => props.theme.mediaQueries.m}) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: ${props => props.theme.spaceUnits.m} 0px;
  }
`;

export const Account = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spaceUnits.xs} ${props => props.theme.spaceUnits.m};
  font-size: ${props => props.theme.fontSizes.s};
  justify-content: center;

  @media (${props => props.theme.mediaQueries.m}) {
    flex: 1 0 auto;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }
`;

export const AccountName = styled.div`
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.m};
  margin-bottom: ${props => props.theme.spaceUnits.xxs};

  @media (${props => props.theme.mediaQueries.m}) {
    margin-bottom: 0;
  }
`;

export const AccountInfo = styled.div``;

export const AccountInfoItem = styled.span`
  text-transform: uppercase;
  &::before {
    content: '|';
    margin-right: ${props => props.theme.spaceUnits.xxs};
    padding-left: ${props => props.theme.spaceUnits.xxs};
    color: ${props => props.theme.otherColors.grey};
  }

  &:first-child::before {
    content: '';
    margin-right: 0;
    padding-left: 0;
  }
`;

export const AccountAddress = styled(AccountInfoItem)``;

export const AccountNetwork = styled(AccountInfoItem)``;

export const AccountBalance = styled(AccountInfoItem)``;