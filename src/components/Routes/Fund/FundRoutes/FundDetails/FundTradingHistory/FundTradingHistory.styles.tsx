import styled from 'styled-components';
import { Subtitle, PaddedBody } from '~/components/Common/Styles/Styles';

export const Wrapper = styled.div`
  @media (${props => props.theme.mediaQueries.l}) {
    flex: 1;
    border-right: 1px solid rgb(234, 229, 212);
    border-top: none;
    flex: 0 0 50%;
    order: 1;
  }
`;

export const Title = Subtitle;

export const Table = styled.table`
  background-color: ${props => props.theme.otherColors.white};
  margin-top: ${props => props.theme.spaceUnits.m};
  margin-bottom: ${props => props.theme.spaceUnits.m};
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
`;

export const HeaderCell = styled.th`
  text-align: left;
  padding: ${props => props.theme.spaceUnits.s};
`;

export const HeaderCellRightAlign = styled.th`
  text-align: right;
  padding: ${props => props.theme.spaceUnits.s};
`;

export const HeaderRow = styled.tr`
  font-weight: bold;
  border-bottom: 1px solid rgb(234, 229, 212);
`;

export const BodyCell = styled.td`
  padding: ${props => props.theme.spaceUnits.s};
`;

export const BodyCellRightAlign = styled.td`
  padding: ${props => props.theme.spaceUnits.s};
  text-align: right;
`;

export const BodyRow = styled.tr`
  border-top: 1px solid ${props => props.theme.mainColors.border};
  border-bottom: 1px dashed rgb(234, 229, 212);
`;

export const NoRegisteredPolicies = styled.div`
  padding: ${props => props.theme.spaceUnits.s};
`;