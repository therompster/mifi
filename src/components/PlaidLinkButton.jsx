import React, { useEffect, useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '../api';

const PlaidLinkButton = ({ onSuccess, onExit }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get a link token when the component mounts
  useEffect(() => {
    const fetchLinkToken = async () => {
      setIsLoading(true);
      try {
        const response = await createLinkToken();
        setLinkToken(response.data.link_token);
      } catch (err) {
        console.error('Error fetching link token:', err);
        setError('Failed to load bank connection. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  // Handle successful link
  const onPlaidSuccess = useCallback(
    async (publicToken, metadata) => {
      setIsLoading(true);
      try {
        // Exchange the public token for an access token
        await exchangePublicToken(
          publicToken,
          metadata.institution.institution_id,
          metadata.institution.name
        );
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('Error exchanging public token:', err);
        setError('Failed to connect your bank account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  // Initialize the Plaid Link hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => onPlaidSuccess(public_token, metadata),
    onExit: (err, metadata) => {
      if (err && err.error_code !== 'USER_CLOSED') {
        setError('Error connecting to your bank. Please try again.');
      }
      if (onExit) onExit(err, metadata);
    },
  });

  return (
    <div>
      <button
        onClick={() => open()}
        disabled={!ready || isLoading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#22C55E',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: ready && !isLoading ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          opacity: ready && !isLoading ? 1 : 0.7,
        }}
      >
        {isLoading ? 'Connecting...' : 'Link your bank account'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
    </div>
  );
};

export default PlaidLinkButton;
