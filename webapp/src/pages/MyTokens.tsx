import React, { FC, useEffect, useState } from "react";
import { TokenCard } from "../components/TokenCard";
import { useContract } from "../hooks/useContract";
import { useMyTreeTokenIndex } from "../hooks/useMyTreeTokenIndex";
import { useWeb3 } from "../hooks/useWeb3";
import { MainLayout } from "../layouts/MainLayout";

export interface MyTokensProps {}

export const MyTokens: FC<MyTokensProps> = (props) => {
  const [index, setIndex] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const { ethersProvider, accountAddress } = useWeb3();
  const contract = useContract();
  const { treeToken, loading } = useMyTreeTokenIndex(index);
  useEffect(() => {
    (async () => {
      const balance = await contract.balanceOf(accountAddress);
      setBalance(balance.toNumber())
    })();
  }, [accountAddress, contract]);

  const onPrevious = () => {
    setIndex(index => index > 0 ? index - 1: index)
  }
  const onNext = () => {
    setIndex(index => index < balance - 1 ? index + 1: index)
  }
  return (
    <MainLayout>
      <div className="flex items-center justify-center mt-8">
        <div className="pb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="">
              <button className="btn btn-ghost btn-outline btn-circle" onClick={onPrevious}>«</button>
              <button className="px-4 cursor-default">{index + 1} / {balance}</button>
              <button className="btn btn-ghost btn-outline btn-circle" onClick={onNext}>»</button>
            </div>
          </div>
          {treeToken && <TokenCard treeToken={treeToken} />}
        </div>
      </div>
    </MainLayout>
  );
};
