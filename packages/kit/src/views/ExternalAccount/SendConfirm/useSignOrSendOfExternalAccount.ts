import { useCallback } from 'react';

import { cloneDeep, isString } from 'lodash';
import { useIntl } from 'react-intl';

import type { IUnsignedMessage } from '@onekeyhq/engine/src/types/message';
import {
  EMessageTypesAptos,
  EMessageTypesBtc,
  EMessageTypesCommon,
  EMessageTypesEth,
} from '@onekeyhq/engine/src/types/message';
import type { IEncodedTxEvm } from '@onekeyhq/engine/src/vaults/impl/evm/Vault';
import type { IEncodedTx } from '@onekeyhq/engine/src/vaults/types';
import debugLogger from '@onekeyhq/shared/src/logger/debugLogger';
import flowLogger from '@onekeyhq/shared/src/logger/flowLogger/flowLogger';
import type { IDappSourceInfo } from '@onekeyhq/shared/types';

import backgroundApiProxy from '../../../background/instance/backgroundApiProxy';

import { useSendConfirmInfoOfExternalAccount } from './useSendConfirmInfoOfExternalAccount';

function getEthProviderMethodFromMessageType(
  type:
    | EMessageTypesEth
    | EMessageTypesAptos
    | EMessageTypesCommon
    | EMessageTypesBtc,
) {
  // https://docs.metamask.io/guide/signing-data.html#a-brief-history
  switch (type) {
    case EMessageTypesEth.ETH_SIGN:
      return 'eth_sign';
    case EMessageTypesEth.PERSONAL_SIGN:
      return 'personal_sign';
    case EMessageTypesEth.TYPED_DATA_V1:
      return 'eth_signTypedData';
    case EMessageTypesEth.TYPED_DATA_V3:
      return 'eth_signTypedData_v3';
    case EMessageTypesEth.TYPED_DATA_V4:
      return 'eth_signTypedData_v4';
    case EMessageTypesAptos.SIGN_MESSAGE:
      return 'signMessage';
    case EMessageTypesCommon.SIGN_MESSAGE:
      return 'signMessage';
    case EMessageTypesCommon.SIMPLE_SIGN:
      return 'signMessage';
    case EMessageTypesBtc.ECDSA:
      return 'signMessage';
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const checkType = type;
  }
}

export function useSignOrSendOfExternalAccount({
  encodedTx,
  unsignedMessage,
  sourceInfo,
  networkId,
  accountId,
  signOnly,
}: {
  encodedTx: IEncodedTx | undefined;
  unsignedMessage?: IUnsignedMessage | undefined;
  sourceInfo?: IDappSourceInfo | undefined;
  networkId: string;
  accountId: string;
  signOnly: boolean;
}) {
  const intl = useIntl();
  const { validator } = backgroundApiProxy;
  const { getExternalConnector, externalAccountInfo } =
    useSendConfirmInfoOfExternalAccount({
      accountId,
      networkId,
    });

  // use background service is not available here, as walletconnect connector is in UI )
  const sendTxForExternalAccount = useCallback(
    async (txForExternalAccount?: IEncodedTx) => {
      const tx = txForExternalAccount || encodedTx;
      if (!tx) {
        throw new Error('encodedTx is missing!');
      }
      let txid = '';
      const { wcConnector, injectedConnectorInfo, accountInfo } =
        await getExternalConnector();
      if (accountInfo?.type === 'walletConnect') {
        if (!wcConnector) {
          return;
        }
        if (signOnly) {
          txid = await wcConnector.signTransaction(tx as IEncodedTxEvm);
        } else {
          txid = await wcConnector.sendTransaction(tx as IEncodedTxEvm);
        }
      }
      if (accountInfo?.type === 'injectedProvider') {
        const connector = injectedConnectorInfo?.connector;
        if (!connector) {
          return;
        }
        txid = (await connector?.provider?.request({
          method: signOnly ? 'eth_signTransaction' : 'eth_sendTransaction',
          params: [tx],
        })) as string;
      }

      debugLogger.walletConnect.info(
        'sendTxForExternalAccount -> sendTransaction txid: ',
        txid,
      );
      // TODO currently ExternalAccount is for EVM only
      if (txid && (await validator.isValidEvmTxid({ txid }))) {
        return {
          txid,
          rawTx: '',
          encodedTx: tx,
        };
      }

      // BitKeep resolve('拒绝') but not reject(error)
      const errorMsg =
        txid && isString(txid)
          ? txid
          : intl.formatMessage({ id: 'msg__transaction_failed' });
      throw new Error(errorMsg);
    },
    [encodedTx, validator, intl, getExternalConnector, signOnly],
  );

  const signMsgForExternalAccount = useCallback(async () => {
    if (!unsignedMessage) {
      throw new Error('unsignedMessage is missing!');
    }
    const rawMesssage = unsignedMessage.payload;
    const signMethodType = unsignedMessage.type;
    let result = '';
    const { wcConnector, injectedConnectorInfo, accountInfo } =
      await getExternalConnector();
    if (accountInfo?.type === 'walletConnect') {
      if (!wcConnector) {
        return;
      }
      if (signMethodType === EMessageTypesEth.PERSONAL_SIGN) {
        result = await wcConnector.signPersonalMessage(rawMesssage);
      } else if (signMethodType === EMessageTypesEth.ETH_SIGN) {
        result = await wcConnector.signMessage(rawMesssage);
      } else {
        const typedDataMessage = cloneDeep(rawMesssage) as any[];
        if (
          signMethodType === EMessageTypesEth.TYPED_DATA_V3 ||
          signMethodType === EMessageTypesEth.TYPED_DATA_V4
        ) {
          const secondInfo = typedDataMessage?.[1];
          if (secondInfo && typeof secondInfo === 'string') {
            try {
              // do NOT need to JSON object
              // typedDataMessage[1] = JSON.parse(secondInfo);
            } catch (error) {
              flowLogger.error.log(error);
            }
          }
        }
        result = await wcConnector.signTypedData(typedDataMessage);
      }
    }

    if (accountInfo?.type === 'injectedProvider') {
      const connector = injectedConnectorInfo?.connector;
      if (!connector) {
        return;
      }
      let method = getEthProviderMethodFromMessageType(signMethodType);
      method = method || sourceInfo?.data?.method || '';
      result = (await connector.provider?.request({
        method,
        params: rawMesssage,
      })) as string;
    }

    return result;
  }, [unsignedMessage, getExternalConnector, sourceInfo?.data?.method]);

  return {
    externalAccountInfo,
    sendTxForExternalAccount,
    signMsgForExternalAccount,
  };
}