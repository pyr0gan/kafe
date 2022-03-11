import { useCallback, useState } from 'react';
import { useDapp } from './useDapp';
import useApiCall from './useApiCall';
import routes from '../routes';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { TutorialMetadata } from '@app/types/index';
import { stringToSlug } from 'utils/strings';
import {
  useGetDaoState,
  useProposeTutorial as solanaUseProposeTutorial,
} from '@builderdao-sdk/dao-program';

type StoreMetadataResponse = {
  did: string;
  streamId: string;
};

export const useProposeTutorial = <AD>(): [
  (data: AD) => Promise<void>,
  {
    submitting: boolean;
    error: Error;
  },
] => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState(null);

  const {
    wallet: { publicKey },
  } = useDapp();
  const { daoState, loading } = useGetDaoState();

  const [proposeTutorial] = solanaUseProposeTutorial();
  const [createIndexRecord] = useApiCall<any, any>(
    routes.api.tutorials.createIndexRecord,
  );
  const [storeMetadata] = useApiCall<TutorialMetadata, StoreMetadataResponse>(
    routes.api.tutorials.storeMetadata,
  );

  const handleAction = useCallback(
    async data => {
      if (!publicKey) throw new WalletNotConnectedError();

      try {
        setError(null);
        setSubmitting(true);

        const id = daoState.numberOfTutorial.toNumber();
        const slug = stringToSlug(data.title);

        // Store Metadata to Ceramic. Get CID
        const { streamId } = await storeMetadata({
          data: {
            title: data.title,
            slug,
            description: data.description,
            difficulty: data.difficulty,
            tags: data.tags,
          },
        });

        console.log('StreamID', streamId);

        // Create tutorial in Solana program
        const txHash = await proposeTutorial({
          id,
          userPk: publicKey,
          slug,
          streamId,
        });

        console.log('TX Hash', txHash);

        await createIndexRecord({
          data: {
            id: id.toString(),
            slug,
            title: data.title,
            description: data.description,
            author: publicKey.toString(),
            difficulty: data.difficulty,
            tags: data.tags,
          },
        });
      } catch (err) {
        console.log('ERR:', err);
        setError(err);
        throw new err();
      } finally {
        setSubmitting(false);
      }
    },
    [publicKey, daoState, storeMetadata, proposeTutorial, createIndexRecord],
  );

  return [handleAction, { submitting, error }];
};
