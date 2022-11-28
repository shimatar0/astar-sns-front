import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import abi from "../metadata.json";

export type MessageType = {
  message: string;
  senderId: string;
  createdTime: string;
};

type PropsSM = {
  api: ApiPromise | undefined;
  actingAccount: InjectedAccountWithMeta;
  message: string;
  id: string;
};

type PropsGML = {
  api: ApiPromise | undefined;
  id: number;
};

type PropsGLM = {
  api: ApiPromise | undefined;
  id: number;
};

const contractAddress: string = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as string;

export const sendMessage = async (props: PropsSM) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contract = new ContractPromise(props.api!, abi, contractAddress);
  const performingAccount = props.actingAccount;
  const injector = await web3FromSource(performingAccount.meta.source);
  const date = new Date();
  const add_likes = await contract.tx.sendMessage(
    {
      value: 0,
      gasLimit: 18850000000,
    },
    props.message,
    props.id,
    [date.getMonth() + 1, date.getDate()].join("-") +
      " " +
      [
        date.getHours().toString().padStart(2, "0"),
        date.getMinutes().toString().padStart(2, "0"),
      ].join(":")
  );
  if (injector !== undefined) {
    add_likes.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      (result) => {}
    );
  }
};

// メッセージリストを取得する関数
export const getMessageList = async (props: PropsGML) => {
  const contract = new ContractPromise(props.api!, abi, contractAddress);
  const { gasConsumed, result, output } = await contract.query.getMessageList(
    "",
    {
      value: 0,
      gasLimit: -1,
    },
    props.id,
    1
  );
  if (output !== undefined && output !== null) {
    return output;
  }
  return [];
};

export const getLastMessage = async (props: PropsGLM) => {
  const contract = new ContractPromise(props.api!, abi, contractAddress);
  const { gasConsumed, result, output } = await contract.query.getLastMessage(
    "",
    {
      value: 0,
      gasLimit: -1,
    },
    props.id
  );
  if (output !== undefined && output !== null) {
    return output.toHuman()?.message.toString() ?? "";
  }
};
