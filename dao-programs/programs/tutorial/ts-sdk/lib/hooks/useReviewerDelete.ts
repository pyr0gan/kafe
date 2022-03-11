import routes from '../routes';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import { useTutorialProgram } from './index';
import { PublicKey } from '@solana/web3.js';

type ActionData = {
  authorityPk: PublicKey;
  reviewerPk: PublicKey;
};

export const useReviewerDelete = (): [
  (data: ActionData) => Promise<void>,
  {
    submitting: boolean;
    error: Error | null;
  },
] => {
  const tutorialProgram = useTutorialProgram();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAction = useCallback(
    async (data: ActionData) => {
      try {
        setError(null);
        setSubmitting(true);

        await tutorialProgram.deleteReviewer(data);

        mutate(routes.listOfReviewers);
        mutate(routes.reviewer(data.reviewerPk));
      } catch (err) {
        if (err instanceof Error) {
          console.log('Err:', err);
          setError(err);
        }

        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [tutorialProgram],
  );

  return [handleAction, { submitting, error }];
};
